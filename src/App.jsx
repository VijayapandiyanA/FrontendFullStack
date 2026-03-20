import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = import.meta.env.VITE_API_URL;

function App() {

  console.log("API:", API);

  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
  });

  const [editId, setEditId] = useState(null);

  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit form (FIXED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.category) {
      setError("⚠️ Please fill all fields");
      setSuccess("");
      return;
    }

    try {

      const payload = {
        name: form.name,
        price: Number(form.price), // ✅ FIX (IMPORTANT)
        category: form.category,
      };

      if (editId) {
        await axios.put(`${API}/products/${editId}`, payload);
        setSuccess("✅ Product updated successfully");
        setEditId(null);
      } else {
        await axios.post(`${API}/products`, payload);
        setSuccess("🎉 Product added successfully");
      }

      setError("");
      setForm({ name: "", price: "", category: "" });

      fetchProducts();

      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      console.log("POST ERROR:", err.response?.data); // ✅ DEBUG
      setError("❌ Something went wrong");
    }
  };

  // ✅ Edit
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
    });
    setEditId(product.id);
  };

  // ✅ Delete (FIXED API)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`${API}/products/${id}`); // ✅ FIX
        fetchProducts();
      } catch (err) {
        console.log("DELETE ERROR:", err);
      }
    }
  };

  // Filter
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="container">

      <h2>Product Form</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <button type="submit">
          {editId ? "Update Product" : "Add Product"}
        </button>
      </form>

      <h3>Filter & Sort</h3>

      <div className="filter-sort">
        <input
          placeholder="Search"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort</option>
          <option value="name">Name</option>
          <option value="priceLow">Low</option>
          <option value="priceHigh">High</option>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.category}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default App;