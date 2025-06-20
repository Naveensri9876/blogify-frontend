const postId = new URLSearchParams(window.location.search).get('id');

async function loadPost() {
  const res = await fetch(`http://localhost:3000/api/posts/${postId}`);
  const post = await res.json();

  document.getElementById('title').value = post.title;
  document.getElementById('content').value = post.content;
}

loadPost();

const form = document.getElementById('editForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  const user = firebase.auth().currentUser;
  if (!user) return alert("Login required");

  const idToken = await user.getIdToken();

  const res = await fetch(`http://localhost:3000/api/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ title, content })
  });

  if (res.ok) {
    alert("Post updated!");
    window.location.href = "index.html";
  } else {
    const error = await res.json();
    alert(`Error: ${error.error}`);
  }
});
