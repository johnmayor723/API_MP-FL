const axios = require("axios");

// Helper function to fetch and filter products by category
async function fetchProductsByCategory(categoryName) {
  try {
    // Fetch products from the API
    const response = await axios.get("https://pantry-hub-server.onrender.com/api/products");
    const products = response.data; // Assuming products are in the response's data property

    // Filter products by the provided category
    const filteredProducts = products.filter(product => product.category === categoryName);

    // Return the filtered products
    return filteredProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Unable to fetch products");
  }
}

// Controller to handle the route and call the helper function
async function getProductsByCategory(req, res) {
  const { categoryName } = req.params; // Get category name from route parameter

  try {
    const products = await fetchProductsByCategory(categoryName);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

module.exports = { getProductsByCategory };
