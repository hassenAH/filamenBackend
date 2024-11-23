const request = require("supertest");
const app = require("../app"); // Remplacez par le chemin vers votre app Express

let userToken; // Stockera le token d'utilisateur pour les tests
let adminToken; // Stockera le token d'administrateur
let createdProductId;

describe("Server Features Tests", () => {
  // **Test: Enregistrer un utilisateur**
  it("should register a user", async () => {
    const response = await request(app).post("/api/users/register").send({
      email: "john.doe@example.com",
      password: "password123",
      name: "John Doe"
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered. Please verify your email to activate your account.");
  });

  // **Test: Connexion utilisateur**
  it("should log in a user", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "john.doe@example.com",
      password: "password123"
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    userToken = response.body.accessToken; // Stocker le token pour d'autres tests
  });

  // **Test: Créer une catégorie**
  it("should create a category", async () => {
    const response = await request(app)
      .post("/api/categories/create")
      .send({ name: "Men", description: "Clothing for men" })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Men");
  });

  // **Test: Créer un produit**
  it("should create a product", async () => {
    const response = await request(app)
      .post("/api/products/create")
      .field("title", "Slim Fit Shirt")
      .field("brand", "Filamen")
      .field("description", "High-quality slim-fit shirt for men.")
      .field("price", "29.99")
      .field("stock", "50")
      .field("categoryId", "ID_DU_CATEGORIE_MEN")
      .attach("images", "__tests__/test_files/shirt.jpg") // Remplacez par un chemin valide
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Product Created");
    createdProductId = response.body.product._id;
  });

  // **Test: Passer une commande**
  it("should place an order", async () => {
    const response = await request(app)
      .post("/api/orders/create")
      .send({
        userId: "ID_UTILISATEUR",
        products: [
          { productId: createdProductId, quantity: 2 }
        ]
      })
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Order placed successfully");
  });

  // **Test: Récupérer les factures**
  it("should fetch all invoices (Admin)", async () => {
    const response = await request(app)
      .get("/api/admin/invoices")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  // **Test: Analyser les ventes**
  it("should fetch sales analytics (Admin)", async () => {
    const response = await request(app)
      .get("/api/admin/analytics")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.totalSales).toBeDefined();
    expect(response.body.topProducts).toBeInstanceOf(Array);
  });
});
