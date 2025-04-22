import Admin from "../models/admin.model.js";

export const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne();

    if (!adminExists) {
      await Admin.create({
        name: "Iqro",
        wallet: "0x52aF5f6a96e84D2eA8aFB4e7117562D6007A7A0c",
        isVerified: true,
      });
      console.log("Admin user seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};
