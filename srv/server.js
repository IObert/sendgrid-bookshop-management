const cds = require("@sap/cds");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const upload = multer({ dest: "uploads/" });

async function collectBookDetails(sender, message) {
  if (message.includes("Yes")) {
    const restockPattern = /Yes (\d+)/i;
    const lastOrderPattern = /(\d+)x/;
    const titlePattern = /"(.*?)"/;

    const restock = message.match(restockPattern)
      ? +message.match(restockPattern)[1]
      : undefined;

    const originalMessage = message.match(/>(.*)/g).join("");

    try {
      const lastOrder = +originalMessage.match(lastOrderPattern)[1];
      const title = originalMessage.match(titlePattern)[1];
      const { Books } = cds.entities("my.bookshop");

      const books = await cds.read(Books).where({ title });

      return {
        valid: true,
        restock: restock || lastOrder,
        book: books[0],
      };
    } catch (err) {
      //regex didn't find a last order or book title
      return { valid: false };
    }
  }
  return {
    valid: false,
  };
}

cds.on("bootstrap", (app) => {
  app.post("/sendgridInboud", upload.none(), async (req, res) => {
    const { from } = JSON.parse(req.body.envelope),
      to = req.body.to,
      parsed = await collectBookDetails(from, req.body.text);
    if (
      from === process.env.SENDGRID_RECEIVER &&
      to === process.env.SENDGRID_SENDER &&
      parsed.valid
    ) {
      const newStock = parsed.book.stock + parsed.restock;

      const { Books } = cds.entities("my.bookshop");
      await UPDATE(Books, parsed.book.ID).with({ stock: newStock });
      sgMail.send({
        to: process.env.SENDGRID_RECEIVER,
        from: process.env.SENDGRID_SENDER,
        subject: `RE: ${req.body.subject}`,
        text: `Successfully restocked "${parsed.book.title}". Current stock: ${newStock}`,
        html: `<strong>Successfully restocked "${parsed.book.title}". Current stock: ${newStock}</strong>`,
      });
    } else {
      const msg = {
        to: process.env.SENDGRID_RECEIVER,
        from: process.env.SENDGRID_SENDER,
        subject: `RE: ${req.body.subject}`,
        text: `Failed to restock. Please reply with "Yes <additionalStock>"`,
        html: `<strong>Failed to restock. Please reply with "Yes <additionalStock>"</strong>`,
      };
      sgMail.send(msg);
    }
    res.end("ok");
  });
});
