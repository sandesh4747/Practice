import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    // Fetch all products from MongoDB
    const products = await Product.find({});
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // Try to fetch featured products from Redis cache
    let featuredProducts = await redis.get("featured_products");

    // If found in Redis, return cached version
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    // If not in Redis, fetch from MongoDB
    featuredProducts = await Product.find({ isFeatured: true }).lean(); //// `.lean()` returns plain JS objects (faster)

    // If nothing found in DB, return 404
    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // Cache the result in Redis for faster future access
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    // If an image is provided, upload it to Cloudinary
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products", // Stores image in Cloudinary's "products" folder
      });
    } else {
      cloudinaryResponse = null;
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "", //  Use Cloudinary URL if availabla
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // Find product by ID
    const product = await Product.findById(req.params.id);
    // If not found, send 404
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If image exists, extract publicId from URL to delete from Cloudinary
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // this will get the id of the image
      try {
        // Try to delete image from Cloudinary
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        console.log("deleted image from cloudinary");
      }
    }

    // Delete product from DB
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        // $sample:	Randomly selects a specified number of documents from a collection
        $sample: { size: 4 }, // Randomly select 3 products
      },

      {
        //	$project: Includes/excludes specific fields in the output

        // // Only return selected fields
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    // Send the 3 random recommended products
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    // Find all products with matching category
    const products = await Product.find({ category });
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    // Find product by ID
    const product = await Product.findById(req.params.id);
    if (product) {
      // Toggle the isFeatured status
      product.isFeatured = !product.isFeatured;

      // Save the updated product
      const updatedProduct = await product.save();

      // Update Redis cache with latest featured products
      await updateFeaturedProductCache();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductCache() {
  try {
    // Get all featured products and convert to plain JS objects
    const featuredProducts = await Product.find({ isFeatured: true }).lean();

    // Cache the updated list in Redis
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function");
  }
}
