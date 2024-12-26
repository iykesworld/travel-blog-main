import React, { useState } from "react";
import "./Blog.css";
import SearchBlog from "./SearchBlog";
import { useFetchBlogsQuery } from "../redux/features/blog/blogsApi";
import { Link } from "react-router";

const Blog = () => {
  const [search, setSearch] = useState("");
  const [category, setCatefory] = useState("");
  const [query, setQuery] = useState({
    search: "",
    category: "",
  });
  // get data using redux
  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery(query);
  

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleSearch = () => {
    setQuery({ search, category });
  };
  return (
    <div className="blog">
      <SearchBlog
        search={search}
        handleSearchChange={handleSearchChange}
        handleSearch={handleSearch}
      />
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.toString()}</div>}
      <div className="blogs-post">
        {
            blogs.map(blog =>{
                return <Link to={`/blogs/${blog._id}`} className="blogs-post-content" key={blog._id}>
                    <div className="blog-image-container">
                    <img src={blog.coverImg} alt="blog image" />
                    </div>
                    <h2>{blog.title}</h2>
                </Link>
            })
        }
      </div>
    </div>
  );
};

export default Blog;
