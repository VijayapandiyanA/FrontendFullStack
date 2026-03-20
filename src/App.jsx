import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
const API = import.meta.env.VITE_API_URL;

function App() {
 console.log("API:", import.meta.env.VITE_API_URL); // ✅ ADD HERE
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    category: "",
  });
  

  const [editId, setEditId] = useState(null);

  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;



  // Fetch products
  const fetchProducts = async () => {
  const res = await axios.get(`${API}/products`);
  setProducts(res.data);
};

  useEffect(() => {
    fetchProducts();
  }, []);



  // Input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };



  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category) {
      setError("⚠️ Please fill all fields");
      setSuccess("");
      return;
    }

    try {

      if (editId) {
        await axios.put(`${API}/products/${editId}`, form);
        setSuccess("✅ Product updated successfully");
        setEditId(null);
      } else {
        await axios.post(`${API}/products`, form);
        setSuccess("🎉 Product added successfully");
      }

      setError("");
      setForm({ name: "", price: "", category: "" });

      fetchProducts();

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      setError("❌ Something went wrong");
    }
  };



  // Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
    });

    setEditId(product.id);
  };



  // Delete product
  const handleDelete = async (id) => {

    if (window.confirm("Are you sure you want to delete this product?")) {
      await axios.delete(`http://localhost:5000/products/${id}`);
      fetchProducts();
    }

  };



  // Filter products
  let filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );



  // Sorting
  if (sortBy === "name") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortBy === "priceLow") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sortBy === "priceHigh") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sortBy === "latest") {
    filteredProducts.sort((a, b) => b.id - a.id);
  }

  if (sortBy === "oldest") {
    filteredProducts.sort((a, b) => a.id - b.id);
  }



  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);



  return (
    <div className="container">

      <h2>Product Form</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}



      <form onSubmit={handleSubmit}>

        <input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <button type="submit">
          {editId ? "Update Product" : "Add Product"}
        </button>

      </form>



      <h3>Filter & Sort</h3>

      <div className="filter-sort">

        <input
          className="filter-input"
          placeholder="Search by product name"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >

          <option value="">Sort By</option>
          <option value="name">Name A-Z</option>
          <option value="priceLow">Price Low → High</option>
          <option value="priceHigh">Price High → Low</option>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>

        </select>

      </div>



      <h2>Product List</h2>

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

  {filter !== "" && currentProducts.length === 0 ? (

    <tr>
      <td colSpan="5" className="no-data">
        ❌ No products found for "{filter}"
      </td>
    </tr>

  ) : (

    currentProducts.map((product) => (

      <tr key={product.id}>

        <td>{product.id}</td>
        <td>{product.name}</td>
        <td>{product.price}</td>
        <td>{product.category}</td>

        <td>

          <button
            className="edit-btn"
            onClick={() => handleEdit(product)}
          >
            Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => handleDelete(product.id)}
          >
            Delete
          </button>

        </td>

      </tr>

    ))

  )}

</tbody>

      </table>



      {/* PAGINATION */}

      <div className="pagination">

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, index) => (

          <button
            key={index}
            className={currentPage === index + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>

        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>

      </div>

    </div>
  );
}

export default App;