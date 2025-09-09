// Blog Platform JavaScript - Complete Implementation

// Global State
let currentUser = null;
let posts = [];
let currentPost = null;
let editingPostId = null;

// Sample Data - In a real app, this would come from a backend API
const sampleUsers = [
  { id: 1, username: "admin", email: "admin@blog.com", password: "admin123" },
  {
    id: 2,
    username: "johndoe",
    email: "john@blog.com",
    password: "password123",
  },
];

let samplePosts = [
  {
    id: 1,
    title: "Getting Started with Modern JavaScript",
    content:
      "JavaScript has evolved tremendously over the years. In this post, we'll explore modern JavaScript features like arrow functions, destructuring, async/await, and more.\n\nArrow functions provide a more concise way to write functions:\nconst add = (a, b) => a + b;\n\nDestructuring allows us to extract values from arrays and objects:\nconst {name, age} = user;\nconst [first, second] = numbers;\n\nAsync/await makes asynchronous code more readable:\nasync function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}",
    author: "johndoe",
    authorId: 2,
    category: "technology",
    tags: "javascript,programming,web-development",
    datePosted: "2024-01-15",
    likes: 15,
    dislikes: 2,
    comments: [
      {
        id: 1,
        author: "admin",
        content: "Great post! Very informative.",
        datePosted: "2024-01-15",
      },
      {
        id: 2,
        author: "johndoe",
        content: "Thanks! I'm glad you found it helpful.",
        datePosted: "2024-01-15",
      },
    ],
  },
  {
    id: 2,
    title: "The Art of Minimalist Living",
    content:
      "Minimalism isn't just about having fewer possessions—it's about making room for what truly matters in your life.\n\nIn our consumer-driven society, we're constantly bombarded with messages telling us we need more stuff to be happy. But what if the opposite were true? What if having less could lead to more fulfillment?\n\nMinimalist living is about being intentional with your choices. It's about asking yourself: Does this item, commitment, or relationship add value to my life? If the answer is no, it might be time to let it go.\n\nSome benefits of minimalist living:\n- Reduced stress and anxiety\n- More time for meaningful activities\n- Improved focus and clarity\n- Financial freedom\n- Environmental consciousness\n\nStart small. Choose one area of your life—maybe your closet or your digital subscriptions—and begin the process of conscious reduction.",
    author: "admin",
    authorId: 1,
    category: "lifestyle",
    tags: "minimalism,lifestyle,wellness",
    datePosted: "2024-01-20",
    likes: 23,
    dislikes: 1,
    comments: [
      {
        id: 3,
        author: "johndoe",
        content:
          "I've been trying to embrace minimalism. This is very inspiring!",
        datePosted: "2024-01-20",
      },
    ],
  },
  {
    id: 3,
    title: "Exploring Tokyo: A Food Lover's Guide",
    content:
      "Tokyo is a culinary paradise that offers everything from street food to Michelin-starred dining experiences. Here's your guide to eating your way through Japan's capital.\n\n**Must-Try Experiences:**\n\n1. **Tsukiji Outer Market** - Start your day with the freshest sushi breakfast you'll ever have. Try the tuna sashimi at Daiwa Sushi.\n\n2. **Ramen Yokocho** - Every neighborhood has its ramen shop, but the alleys of Shibuya and Shinjuku offer some of the best bowls in the city.\n\n3. **Depachika** - The basement food courts of department stores like Mitsukoshi and Takashimaya are food wonderlands.\n\n4. **Izakaya Culture** - These casual drinking establishments serve amazing small plates. Try yakitori, gyoza, and sake.\n\n5. **Konbini Food** - Don't overlook convenience store food! The quality is surprisingly high.\n\n**Pro Tips:**\n- Learn basic Japanese food terms\n- Carry cash (many places don't accept cards)\n- Don't tip (it's not customary in Japan)\n- Slurping noodles is totally acceptable!\n\nTokyo's food scene is constantly evolving, so don't be afraid to try something new and unexpected.",
    author: "admin",
    authorId: 1,
    category: "travel",
    tags: "tokyo,food,travel,japan",
    datePosted: "2024-02-01",
    likes: 31,
    dislikes: 0,
    comments: [
      {
        id: 4,
        author: "johndoe",
        content:
          "Great guide! I'm planning a trip to Tokyo and this is super helpful.",
        datePosted: "2024-02-01",
      },
      {
        id: 5,
        author: "admin",
        content:
          "Have an amazing trip! Feel free to ask if you need more recommendations.",
        datePosted: "2024-02-01",
      },
    ],
  },
];

let nextPostId = 4;
let nextCommentId = 6;

// User Reactions Storage
let userReactions = {}; // postId: { userId: 'like'|'dislike' }

// Initialize App
document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in (in real app, check with backend)
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateNavigation();
  }

  // Load sample reactions
  userReactions = {
    1: { 1: "like", 2: "like" },
    2: { 1: "like", 2: "like" },
    3: { 1: "like", 2: "like" },
  };

  // Show home page by default
  showPage("home");
  loadPosts();
});

// Navigation Functions
function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => {
    page.style.display = "none";
    page.classList.remove("active");
  });

  // Show selected page
  const targetPage = document.getElementById(pageId + "-page");
  if (targetPage) {
    targetPage.style.display = "block";
    targetPage.classList.add("active");
  }

  // Load page-specific content
  switch (pageId) {
    case "home":
      loadPosts();
      break;
    case "my-posts":
      if (currentUser) {
        loadMyPosts();
      } else {
        showPage("login");
      }
      break;
    case "login":
      document.getElementById("login-form").reset();
      break;
    case "register":
      document.getElementById("register-form").reset();
      break;
  }
}

function showCreatePage() {
  if (!currentUser) {
    showFlashMessage("Please log in to create posts", "error");
    showPage("login");
    return;
  }

  editingPostId = null;
  document.getElementById("create-title").textContent = "Create New Post";
  document.getElementById("submit-btn").textContent = "Create Post";
  document.getElementById("post-form").reset();
  document.getElementById("edit-post-id").value = "";
  showPage("create");
}

function showEditPage(postId) {
  if (!currentUser) {
    showFlashMessage("Please log in to edit posts", "error");
    return;
  }

  const post = samplePosts.find((p) => p.id === parseInt(postId));
  if (!post) {
    showFlashMessage("Post not found", "error");
    return;
  }

  if (post.authorId !== currentUser.id) {
    showFlashMessage("You can only edit your own posts", "error");
    return;
  }

  editingPostId = postId;
  document.getElementById("create-title").textContent = "Edit Post";
  document.getElementById("submit-btn").textContent = "Update Post";
  document.getElementById("edit-post-id").value = postId;
  document.getElementById("post-title").value = post.title;
  document.getElementById("post-category").value = post.category || "";
  document.getElementById("post-tags").value = post.tags || "";
  document.getElementById("post-content").value = post.content;

  showPage("create");
}

function updateNavigation() {
  const navLogin = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const navUser = document.getElementById("nav-user");
  const navCreate = document.getElementById("nav-create");
  const navMyPosts = document.getElementById("nav-my-posts");

  if (currentUser) {
    navLogin.style.display = "none";
    navRegister.style.display = "none";
    navUser.style.display = "block";
    navCreate.style.display = "block";
    navMyPosts.style.display = "block";
    document.getElementById("username").textContent = currentUser.username;
  } else {
    navLogin.style.display = "block";
    navRegister.style.display = "block";
    navUser.style.display = "none";
    navCreate.style.display = "none";
    navMyPosts.style.display = "none";
  }
}

// Authentication Functions
function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const username = formData.get("username");
  const password = formData.get("password");

  // In real app, this would be an API call
  const user = sampleUsers.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    currentUser = { id: user.id, username: user.username, email: user.email };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    updateNavigation();
    showFlashMessage("Login successful!");
    showPage("home");
  } else {
    showFlashMessage("Invalid username or password", "error");
  }
}

function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  // Check if user already exists
  if (sampleUsers.find((u) => u.username === username)) {
    showFlashMessage("Username already exists", "error");
    return;
  }

  if (sampleUsers.find((u) => u.email === email)) {
    showFlashMessage("Email already registered", "error");
    return;
  }

  // Add new user
  const newUser = {
    id: sampleUsers.length + 1,
    username,
    email,
    password,
  };
  sampleUsers.push(newUser);

  showFlashMessage("Registration successful! Please log in.");
  showPage("login");
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  updateNavigation();
  showFlashMessage("Logged out successfully!");
  showPage("home");
}

// Post Functions
function loadPosts() {
  const container = document.getElementById("posts-container");
  const noPostsMessage = document.getElementById("no-posts");

  if (samplePosts.length === 0) {
    container.innerHTML = "";
    noPostsMessage.style.display = "block";
    return;
  }

  noPostsMessage.style.display = "none";
  container.innerHTML = samplePosts
    .map((post) => createPostCard(post))
    .join("");
}

function loadMyPosts() {
  const container = document.getElementById("my-posts-container");
  const noPostsMessage = document.getElementById("no-my-posts");

  const myPosts = samplePosts.filter(
    (post) => post.authorId === currentUser.id
  );

  if (myPosts.length === 0) {
    container.innerHTML = "";
    noPostsMessage.style.display = "block";
    return;
  }

  noPostsMessage.style.display = "none";
  container.innerHTML = myPosts
    .map((post) => createPostCard(post, true))
    .join("");
}

function createPostCard(post, isMyPost = false) {
  const tags = post.tags
    ? post.tags
        .split(",")
        .map(
          (tag) =>
            `<a href="#" class="tag" onclick="filterByTag('${tag.trim()}')">${tag.trim()}</a>`
        )
        .join("")
    : "";

  const editButtons = isMyPost
    ? `
        <button class="btn btn-secondary btn-small" onclick="showEditPage(${post.id})">Edit</button>
        <button class="btn btn-danger btn-small" onclick="deletePost(${post.id})">Delete</button>
    `
    : "";

  return `
        <div class="post-card">
            <div class="post-title">
                <a href="#" onclick="viewPost(${post.id})">${post.title}</a>
            </div>
            <div class="post-meta">
                <div>
                    <strong>By:</strong> ${post.author} | 
                    <strong>Date:</strong> ${post.datePosted}
                    ${
                      post.category
                        ? ` | <strong>Category:</strong> ${post.category}`
                        : ""
                    }
                </div>
            </div>
            <div class="post-content">${post.content.substring(0, 200)}${
    post.content.length > 200 ? "..." : ""
  }</div>
            ${tags ? `<div class="post-tags">${tags}</div>` : ""}
            <div class="post-stats">
                <div class="stat">👍 ${post.likes}</div>
                <div class="stat">👎 ${post.dislikes}</div>
                <div class="stat">💬 ${post.comments.length}</div>
            </div>
            <div class="post-actions">
                <button class="btn btn-primary btn-small" onclick="viewPost(${
                  post.id
                })">Read More</button>
                ${editButtons}
            </div>
        </div>
    `;
}

function handlePostSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const postData = {
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category") || null,
    tags: formData.get("tags") || "",
    author: currentUser.username,
    authorId: currentUser.id,
    datePosted: new Date().toISOString().split("T")[0],
    likes: 0,
    dislikes: 0,
    comments: [],
  };

  if (editingPostId) {
    // Update existing post
    const postIndex = samplePosts.findIndex(
      (p) => p.id === parseInt(editingPostId)
    );
    if (postIndex !== -1) {
      samplePosts[postIndex] = { ...samplePosts[postIndex], ...postData };
      showFlashMessage("Post updated successfully!");
    }
  } else {
    // Create new post
    postData.id = nextPostId++;
    samplePosts.unshift(postData);
    showFlashMessage("Post created successfully!");
  }

  showPage("home");
}

function deletePost(postId) {
  if (!currentUser) {
    showFlashMessage("Please log in to delete posts", "error");
    return;
  }

  const post = samplePosts.find((p) => p.id === parseInt(postId));
  if (!post) {
    showFlashMessage("Post not found", "error");
    return;
  }

  if (post.authorId !== currentUser.id) {
    showFlashMessage("You can only delete your own posts", "error");
    return;
  }

  if (confirm("Are you sure you want to delete this post?")) {
    const index = samplePosts.findIndex((p) => p.id === parseInt(postId));
    samplePosts.splice(index, 1);
    delete userReactions[postId];
    showFlashMessage("Post deleted successfully!");

    // Refresh current page
    const currentPage = document.querySelector(".page.active");
    if (currentPage && currentPage.id === "my-posts-page") {
      loadMyPosts();
    } else {
      loadPosts();
    }
  }
}

function viewPost(postId) {
  const post = samplePosts.find((p) => p.id === parseInt(postId));
  if (!post) {
    showFlashMessage("Post not found", "error");
    return;
  }

  currentPost = post;

  const tags = post.tags
    ? post.tags
        .split(",")
        .map(
          (tag) =>
            `<a href="#" class="tag" onclick="filterByTag('${tag.trim()}'); showPage('home')">${tag.trim()}</a>`
        )
        .join("")
    : "";

  const editButtons =
    currentUser && post.authorId === currentUser.id
      ? `
        <button class="btn btn-secondary" onclick="showEditPage(${post.id})">Edit Post</button>
        <button class="btn btn-danger" onclick="deletePost(${post.id}); showPage('home')">Delete Post</button>
    `
      : "";

  // Get user's reaction to this post
  const userReaction =
    currentUser &&
    userReactions[postId] &&
    userReactions[postId][currentUser.id];
  const likeClass = userReaction === "like" ? "active-like" : "";
  const dislikeClass = userReaction === "dislike" ? "active-dislike" : "";

  const likeButtons = currentUser
    ? `
        <a href="#" class="like-btn ${likeClass}" onclick="toggleReaction(${postId}, 'like')">
            👍 Like (${post.likes})
        </a>
        <a href="#" class="like-btn ${dislikeClass}" onclick="toggleReaction(${postId}, 'dislike')">
            👎 Dislike (${post.dislikes})
        </a>
    `
    : `
        <span class="like-btn">👍 ${post.likes}</span>
        <span class="like-btn">👎 ${post.dislikes}</span>
        <span style="color: #666; font-size: 0.9rem;">Login to like/dislike posts</span>
    `;

  document.getElementById("post-content").innerHTML = `
        <div class="post-view">
            <h1 class="post-view-title">${post.title}</h1>
            <div class="post-view-meta">
                <div>
                    <strong>By:</strong> ${post.author} | 
                    <strong>Date:</strong> ${post.datePosted}
                    ${
                      post.category
                        ? ` | <strong>Category:</strong> ${post.category}`
                        : ""
                    }
                </div>
            </div>
            ${
              tags
                ? `<div class="post-tags" style="margin-bottom: 2rem;">${tags}</div>`
                : ""
            }
            <div class="post-view-content">${post.content}</div>
            <div class="post-actions">
                <button class="btn btn-secondary" onclick="showPage('home')">← Back to Posts</button>
                ${editButtons}
            </div>
            <div class="like-section">
                ${likeButtons}
            </div>
        </div>
    `;

  // Show/hide comment form
  const commentFormContainer = document.getElementById(
    "comment-form-container"
  );
  if (currentUser) {
    commentFormContainer.style.display = "block";
  } else {
    commentFormContainer.style.display = "none";
  }

  // Load comments
  loadComments(postId);

  showPage("post");
}

function toggleReaction(postId, reactionType) {
  if (!currentUser) {
    showFlashMessage("Please log in to react to posts", "error");
    return;
  }

  const post = samplePosts.find((p) => p.id === parseInt(postId));
  if (!post) return;

  // Initialize user reactions for this post if not exists
  if (!userReactions[postId]) {
    userReactions[postId] = {};
  }

  const currentReaction = userReactions[postId][currentUser.id];

  // Remove previous reaction if exists
  if (currentReaction === "like") {
    post.likes--;
  } else if (currentReaction === "dislike") {
    post.dislikes--;
  }

  // Add new reaction if different from current
  if (currentReaction !== reactionType) {
    if (reactionType === "like") {
      post.likes++;
    } else if (reactionType === "dislike") {
      post.dislikes++;
    }
    userReactions[postId][currentUser.id] = reactionType;
  } else {
    // Remove reaction if clicking the same button
    delete userReactions[postId][currentUser.id];
  }

  // Refresh the post view
  viewPost(postId);
}

// Comment Functions
function loadComments(postId) {
  const post = samplePosts.find((p) => p.id === parseInt(postId));
  if (!post) return;

  const commentsList = document.getElementById("comments-list");

  if (post.comments.length === 0) {
    commentsList.innerHTML =
      '<p style="color: #666; text-align: center; padding: 2rem;">No comments yet. Be the first to comment!</p>';
    return;
  }

  commentsList.innerHTML = post.comments
    .map(
      (comment) => `
        <div class="comment">
            <div class="comment-meta">
                <strong>${comment.author}</strong>
                <span>${comment.datePosted}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `
    )
    .join("");
}

function handleCommentSubmit(event) {
  event.preventDefault();

  if (!currentUser) {
    showFlashMessage("Please log in to comment", "error");
    return;
  }

  if (!currentPost) {
    showFlashMessage("No post selected", "error");
    return;
  }

  const formData = new FormData(event.target);
  const content = formData.get("content").trim();

  if (!content) {
    showFlashMessage("Please enter a comment", "error");
    return;
  }

  const comment = {
    id: nextCommentId++,
    author: currentUser.username,
    content: content,
    datePosted: new Date().toISOString().split("T")[0],
  };

  currentPost.comments.push(comment);

  // Clear form and reload comments
  event.target.reset();
  loadComments(currentPost.id);

  showFlashMessage("Comment added successfully!");
}

// Search and Filter Functions
function searchPosts(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const searchTerm = formData.get("search").toLowerCase().trim();
  const category = formData.get("category");
  const tag = formData.get("tag").toLowerCase().trim();

  let filteredPosts = samplePosts;

  // Apply search filter
  if (searchTerm) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter
  if (category) {
    filteredPosts = filteredPosts.filter((post) => post.category === category);
  }

  // Apply tag filter
  if (tag) {
    filteredPosts = filteredPosts.filter(
      (post) => post.tags && post.tags.toLowerCase().includes(tag)
    );
  }

  // Display filtered posts
  const container = document.getElementById("posts-container");
  const noPostsMessage = document.getElementById("no-posts");

  if (filteredPosts.length === 0) {
    container.innerHTML = "";
    noPostsMessage.style.display = "block";
    noPostsMessage.querySelector("h3").textContent =
      "No posts found matching your criteria";
  } else {
    noPostsMessage.style.display = "none";
    container.innerHTML = filteredPosts
      .map((post) => createPostCard(post))
      .join("");
  }
}

function filterByTag(tag) {
  document.getElementById("tag-filter").value = tag;
  const form = document.querySelector(".search-form");
  searchPosts({ preventDefault: () => {}, target: form });
}

function clearFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("category-filter").value = "";
  document.getElementById("tag-filter").value = "";
  loadPosts();
}

// Utility Functions
function showFlashMessage(message, type = "success") {
  const flashContainer = document.getElementById("flash-messages");

  const messageDiv = document.createElement("div");
  messageDiv.className = `flash-message ${type}`;
  messageDiv.innerHTML = `
        ${message}
        <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;

  flashContainer.appendChild(messageDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentElement) {
      messageDiv.remove();
    }
  }, 5000);
}

// Initialize sample data with proper structure
function initializeSampleData() {
  // Ensure all posts have required structure
  samplePosts.forEach((post) => {
    if (!post.comments) post.comments = [];
    if (typeof post.likes === "undefined") post.likes = 0;
    if (typeof post.dislikes === "undefined") post.dislikes = 0;
  });
}

// Call initialization
initializeSampleData();
