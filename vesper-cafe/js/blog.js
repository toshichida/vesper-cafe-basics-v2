// Vesper Cafe — ブログ（モック）

const CATEGORY_LABELS = {
  coffee: "Coffee",
  story: "Story",
  event: "Event",
  recipe: "Recipe",
};

let blogData = null;
let activeCategory = "all";

async function loadBlogData() {
  const response = await fetch("data/blog-mock.json");
  if (!response.ok) {
    throw new Error(`Failed to load blog data: ${response.status}`);
  }
  return response.json();
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderPageInfo(blog) {
  document.getElementById("blog-title").textContent = blog.title;
  document.getElementById("blog-subtitle").textContent = blog.subtitle;
  document.getElementById("blog-description").textContent = blog.description;
  document.getElementById("footer-year").textContent = new Date().getFullYear();
}

function renderFilters(categories) {
  const container = document.getElementById("blog-filters");
  container.innerHTML = "";

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `filter-btn${cat.id === "all" ? " active" : ""}`;
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(cat.id === "all"));

    btn.addEventListener("click", () => {
      activeCategory = cat.id;
      container.querySelectorAll(".filter-btn").forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", String(isActive));
      });
      renderPosts(blogData.posts);
    });

    container.appendChild(btn);
  });
}

function createBlogCard(post) {
  const card = document.createElement("article");
  card.className = "blog-card";

  const category = document.createElement("p");
  category.className = "blog-card-category";
  category.textContent = CATEGORY_LABELS[post.category] || post.category;
  card.appendChild(category);

  const title = document.createElement("h2");
  title.className = "blog-card-title";
  title.textContent = post.title;
  card.appendChild(title);

  if (post.titleEn) {
    const titleEn = document.createElement("p");
    titleEn.className = "blog-card-title-en";
    titleEn.textContent = post.titleEn;
    card.appendChild(titleEn);
  }

  const meta = document.createElement("p");
  meta.className = "blog-card-meta";
  meta.textContent = `${formatDate(post.date)} · ${post.author} · ${post.readTime} min read`;
  card.appendChild(meta);

  const excerpt = document.createElement("p");
  excerpt.className = "blog-card-excerpt";
  excerpt.textContent = post.excerpt;
  card.appendChild(excerpt);

  const readBtn = document.createElement("button");
  readBtn.type = "button";
  readBtn.className = "blog-read-btn";
  readBtn.textContent = "Read More";
  readBtn.addEventListener("click", () => showArticle(post));
  card.appendChild(readBtn);

  return card;
}

function renderPosts(posts) {
  const grid = document.getElementById("blog-grid");
  grid.innerHTML = "";

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "blog-loading";
    empty.textContent = "該当する記事はありません。";
    grid.appendChild(empty);
    return;
  }

  filtered.forEach((post) => {
    grid.appendChild(createBlogCard(post));
  });
}

function showArticle(post) {
  const listView = document.getElementById("blog-list-view");
  const articleView = document.getElementById("blog-article-view");
  const article = document.getElementById("blog-article");

  const paragraphs = post.content.split("\n\n").map((p) => `<p>${p}</p>`).join("");

  article.innerHTML = `
    <p class="blog-article-category">${CATEGORY_LABELS[post.category] || post.category}</p>
    <h1 class="blog-article-title">${post.title}</h1>
    ${post.titleEn ? `<p class="blog-article-title-en">${post.titleEn}</p>` : ""}
    <p class="blog-article-meta">${formatDate(post.date)} · ${post.author} · ${post.readTime} min read</p>
    <div class="blog-article-divider" aria-hidden="true"></div>
    <div class="blog-article-body">${paragraphs}</div>
  `;

  listView.hidden = true;
  articleView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showList() {
  document.getElementById("blog-list-view").hidden = false;
  document.getElementById("blog-article-view").hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function init() {
  const grid = document.getElementById("blog-grid");
  grid.innerHTML = '<p class="blog-loading">Loading journal…</p>';

  try {
    blogData = await loadBlogData();
    renderPageInfo(blogData.blog);
    renderFilters(blogData.categories);
    renderPosts(blogData.posts);
    document.getElementById("blog-back-btn").addEventListener("click", showList);
  } catch (err) {
    console.error("Vesper Cafe:", err);
    grid.innerHTML =
      '<p class="blog-error">ブログの読み込みに失敗しました。ローカルサーバーで開いてください。</p>';
  }
}

document.addEventListener("DOMContentLoaded", init);
