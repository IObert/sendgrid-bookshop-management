const cds = require("@sap/cds");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class CatalogService extends cds.ApplicationService {
  init() {
    const { Books } = cds.entities("my.bookshop");

    // Reduce stock of ordered books if available stock suffices
    this.on("submitOrder", async (req) => {
      const { book, quantity } = req.data;
      let { stock, title } = await SELECT`stock, title`.from(Books, book);
      const remaining = stock - quantity;
      if (remaining < 0) {
        return req.reject(409, `${quantity} exceeds stock for book #${book}`);
      }
      await UPDATE(Books, book).with({ stock: remaining });

      if (remaining < 10) {
        const msg = {
          to: process.env.SENDGRID_RECEIVER,
          from: process.env.SENDGRID_SENDER,
          subject: "Low Stock Alert",
          text:
            `A customer just ordered ${quantity}x "${title}" and there are only ${remaining} left in stock. Please respond with "Yes" ` +
            `if you would like to restock now.`,
          html:
            `<strong>A customer just ordered ${quantity}x "${title}" and there are only ${remaining} left in stock. Please respond with "Yes" ` +
            `if you would like to restock now.</strong>`,
        };

        sgMail
          .send(msg)
          .then(() => console.log("Email sent"))
          .catch((error) => console.error(error));
      }

      return { ID: book, stock: remaining };
    });

    return super.init();
  }
}

module.exports = { CatalogService };
