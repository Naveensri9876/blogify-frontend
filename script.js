const firebaseConfig = {
  apiKey: "AIzaSyBPvm1B_OtZWXp8I2qgnTf6_qGpONwHoPU",
  authDomain: "blogify-c71bc.firebaseapp.com",
  projectId: "blogify-c71bc",
  storageBucket: "blogify-c71bc.appspot.com",
  messagingSenderId: "101964903652",
  appId: "1:101964903652:web:d6208109a476381389e8f1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const API = "http://localhost:3000/api";

// ✅ Create a new post
async function createPost() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to create a post.");
  const idToken = await user.getIdToken();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const post = { title, content, authorId: user.uid };

  const res = await fetch(`${API}/posts`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(post)
  });

  if (res.ok) {
    alert("Post created!");
    window.location.href = "dashboard.html";
  } else {
    alert("Failed to create post");
  }
}

// ✅ Load posts on dashboard
function loadPosts() {
  auth.onAuthStateChanged(async (user) => {
    const container = document.getElementById('posts');
    const res = await fetch(`${API}/posts`);
    const posts = await res.json();
    container.innerHTML = "";

    if (posts.length === 0) {
      container.innerHTML = "<p>No posts available.</p>";
      return;
    }

    posts.forEach(p => {
      console.log("📝 Post:", p);
      console.log("👤 Logged in UID:", user?.uid);

      const postEl = document.createElement('div');
      postEl.className = "post-card";

      let buttons = "";
      if (user && p.authorId === user.uid) {
        console.log("✅ Match found — showing Edit/Delete");
        buttons = `
          <button onclick="editPost('${p._id}')">Edit</button>
          <button onclick='deletePost("${p._id}")'>Delete</button>
        `;
      } else {
        console.log("❌ No match — not showing buttons");
      }

      postEl.innerHTML = `
        <h2>${p.title}</h2>
        <p>${p.content.slice(0, 100)}...</p>
        <a href="view.html?id=${p._id}">Read More</a>
        ${buttons}
      `;

      container.appendChild(postEl);
    });
  });
}


// ✅ Navigate to edit page
function editPost(postId) {
  window.location.href = `edit.html?id=${postId}`;
}

// ✅ Delete post
async function deletePost(postId) {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to delete a post.");
  const confirmDelete = confirm("Are you sure you want to delete this post?");
  if (!confirmDelete) return;

  const idToken = await user.getIdToken();

  try {
    const res = await fetch(`${API}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${idToken}`
      }
    });

    if (!res.ok) {
      try {
        const errorData = await res.json();
        alert("Failed to delete post: " + errorData.error);
      } catch {
        alert("Failed to delete post: Post may not exist anymore.");
      }
      return;
    }

    alert("Post deleted.");
    loadPosts();
  } catch (err) {
    alert("Something went wrong while deleting the post.");
  }
}

// ✅ Load individual post
async function loadPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const res = await fetch(`${API}/posts/${postId}`);
  const post = await res.json();

  document.getElementById('post').innerHTML = `
    <div class="container">
      <h2>${post.title}</h2>
      <p>${post.content}</p>
    </div>
  `;

  loadComments(postId);
}

// ✅ Add a comment
async function addComment() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to comment.");

  const idToken = await user.getIdToken();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const text = document.getElementById('commentText').value;

  const res = await fetch(`${API}/comments`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify({ postId, text, authorId: user.uid })
  });

  if (res.ok) {
    document.getElementById('commentText').value = "";
    loadComments(postId);
  } else {
    alert("Failed to post comment");
  }
}

// ✅ Load comments for a post
async function loadComments(postId) {
  const res = await fetch(`${API}/comments/${postId}`);
  const comments = await res.json();
  const container = document.getElementById('comments');
  container.innerHTML = "";

  if (comments.length === 0) {
    container.innerHTML = "<p>No comments yet.</p>";
    return;
  }

  comments.forEach(c => {
    const commentBox = document.createElement('div');
    commentBox.className = "comment-box";
    commentBox.textContent = c.text;
    container.appendChild(commentBox);
  });
}

// ✅ Load post content into edit form
async function loadEditPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const res = await fetch(`${API}/posts/${postId}`);
  const post = await res.json();

  document.getElementById('editTitle').value = post.title;
  document.getElementById('editContent').value = post.content;
}

// ✅ Update edited post
async function updatePost() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to update a post.");
  const idToken = await user.getIdToken();

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  const updatedPost = {
    title: document.getElementById('editTitle').value,
    content: document.getElementById('editContent').value,
  };

  const res = await fetch(`${API}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(updatedPost)
  });

  if (res.ok) {
    alert("Post updated successfully!");
    window.location.href = "dashboard.html";
  } else {
    alert("Failed to update post");
  }
}

// ✅ Login function
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}

// ✅ Register
async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    alert("Registration successful!");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Registration failed: " + error.message);
  }
}

// ✅ Cancel editing
function cancelEdit() {
  window.location.href = "dashboard.html";
}
function logout() {
  firebase.auth().signOut().then(() => {
    alert("Logged out successfully.");
    window.location.href = "login.html"; // or wherever your login page is
  }).catch((error) => {
    alert("Logout failed: " + error.message);
  });
}
