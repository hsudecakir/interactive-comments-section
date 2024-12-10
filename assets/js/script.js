const container = document.querySelector('.container');
let comments = [];
let replies = [];
let currentUser;

async function init() {
  const data = await fetch('assets/json/data.json').then(res => res.json());
  currentUser = data.currentUser;
  console.log(JSON.parse(localStorage.getItem('comments')));
  if(JSON.parse(localStorage.getItem('comments')).length !== 0){
    data = JSON.parse(localStorage.getItem('comments'));
    replies = JSON.parse(localStorage.getItem('replies'));
  }
  render(data, currentUser);
  for (const comment of data.comments) {
    comments.push(comment);
    for (const reply of comment.replies) {
      replies.push(reply);
    }
  }
  addCurrentUserClass(currentUser);
}

init();

function render(commentDatas, currentUser){
  container.innerHTML = `
    <div class="comments"></div>
    <div class="add-comment">
      <img src="assets/images/juliusomo.svg" alt="Profile Picture">
      <textarea id="addCommentTextarea" placeholder="Add a comment…"></textarea>
      <button id="sendBtn">SEND</button>
    </div>
  `;
  renderComments(commentDatas.comments, currentUser);
  sendBtn.addEventListener('click', (e) => addComment(e, commentDatas));
}

function renderComments(commentDatas, currentUser){
  const commentContainer = document.querySelector('.comments');
  commentContainer.innerHTML = '';
  for (const comment of commentDatas) {
    commentContainer.innerHTML += `
      <div class="comment-container">
        <div class="comment" data-username="${comment.user.username}" data-id="${comment.id}">
          <div class="score">
            <i class="fa-solid fa-plus"></i>
            <p>${comment.score}</p>
            <i class="fa-solid fa-minus"></i>
          </div>
          <div class="comment__wrapper">
            <div class="comment__wrapper--top">
              <div class="user-info">
                <img src="assets${comment.user.image.svg}" alt="Profile Picture">
                <p class="username">${comment.user.username}</p>
                <span>you</span>
                <p class="created-at">${comment.createdAt}</p>
              </div>
              <div class="btns">
                <button class="reply-btn" data-id="${comment.id}">
                  <i class="fa-solid fa-reply"></i> Reply
                </button>
                <button class="delete-btn" data-id="${comment.id}">
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
                <button class="edit-btn" data-id="${comment.id}">
                  <i class="fa-solid fa-pen"></i> Edit
                </button>
              </div>
            </div>
            <p class="content">${comment.content}</p>
            ${currentUser.username == comment.user.username ? `<textarea class="editTextarea"></textarea><div class="update-btn-container"><button class="update-btn" data-id="${comment.id}">UPDATE</button></div>` : ''}
          </div>
        </div>
        <div class="reply-container" data-id="${comment.id}"></div>
      </div>
    `
  }
  addCurrentUserClass(currentUser);
  renderReplies(commentDatas, currentUser);
  bindDeleteBtns();
  bindEditBtns(commentDatas); 
  bindReplyBtns(commentDatas);
  localStorage.setItem('comments', JSON.stringify(comments));
  localStorage.setItem('replies', JSON.stringify(replies));
}

function renderReplies(commentDatas, currentUser){
  const replyContainers = document.querySelectorAll('.reply-container');
  for (const replyContainer of replyContainers) {
    const repliedComments = commentDatas.find(x => x.id == replyContainer.dataset.id) || replies.find(x => x.id == replyContainer.dataset.id);
    for (const repliedComment of repliedComments.replies) {
      replyContainer.innerHTML += `
      <div class="reply" data-username="${repliedComment.user.username}" data-id="${repliedComment.id}">
        <div class="score">
          <i class="fa-solid fa-plus"></i>
          <p>${repliedComment.score}</p>
          <i class="fa-solid fa-minus"></i>
        </div>
        <div class="reply__wrapper">
          <div class="reply__wrapper--top">
            <div class="user-info">
              <img src="assets${repliedComment.user.image.svg}" alt="Profile Picture">
              <p class="username">${repliedComment.user.username}</p>
            <span>you</span>
            <p class="created-at">${repliedComment.createdAt}</p>
            </div>
            <div class="btns">
              <button class="reply-btn" data-id="${repliedComment.id}">
                <i class="fa-solid fa-reply"></i> Reply
              </button>
              <button class="delete-btn" data-id="${repliedComment.id}">
                <i class="fa-solid fa-trash"></i> Delete
              </button>
              <button class="edit-btn" data-id="${repliedComment.id}">
                <i class="fa-solid fa-pen"></i> Edit
              </button>
            </div>
          </div>
          <p class="content">
            <span class="replied-to">@${repliedComment.replyingTo}</span>
            ${repliedComment.content}
          </p>
            ${currentUser.username == repliedComment.user.username ? `<textarea class="editTextarea"></textarea><div class="update-btn-container"><button class="update-btn" data-id="${repliedComment.id}">UPDATE</button></div>` : ''}
        </div>
      </div>
      <div class="reply-container" data-id="${repliedComment.id}"></div>
      `
    }
  }
  addCurrentUserClass(currentUser);
}

function addCurrentUserClass(currentUser){
  const replies = document.querySelectorAll('.reply');
  const comments = document.querySelectorAll('.comment');
  for (const reply of replies) {
    if(reply.dataset.username == currentUser.username){
      reply.classList.add('current-user');
    }
  }
  for (const comment of comments) {
    if(comment.dataset.username == currentUser.username){
      comment.classList.add('current-user');
    }
  }
}

function addComment(e, commentDatas){
  for (const comment of comments) {
    for (const reply of comment.replies) {
      replies.push(reply);
    }
  }
  console.log(replies)
  const lastComment = comments[comments.length - 1];
  const lastReply = replies[replies.length - 1];
  if(addCommentTextarea.value.trim() !== ''){
    comments.push(
      {
        id: lastComment.id > lastReply.id ? lastComment.id + 1 : lastReply.id + 1,
        content: `${addCommentTextarea.value}`,
        createdAt: "Just now",
        score: 0,
        user: {
          image: {
            png: `/images/${commentDatas.currentUser.username}.png`,
            svg: `/images/${commentDatas.currentUser.username}.svg`,
            webp: `/images/${commentDatas.currentUser.username}.webp`
          },
          username: `${commentDatas.currentUser.username}`,
        },
        replies: []
      }
    )
    addCommentTextarea.value = '';
  }
  renderComments(comments, currentUser);
}

function bindDeleteBtns(){
  const deleteBtns = document.querySelectorAll('.delete-btn');
  for (const deleteBtn of deleteBtns) {
    deleteBtn.addEventListener('click', deleteComment);
  }
}

function bindEditBtns(commentDatas){
  const editBtns = document.querySelectorAll('.edit-btn');
  for (const editBtn of editBtns) {
    editBtn.addEventListener('click', (e) => editComment(e, commentDatas));
  }
}

function bindReplyBtns(commentDatas, currentUser){
  const replyBtns = document.querySelectorAll('.reply-btn');
  for (const replyBtn of replyBtns) {
    replyBtn.addEventListener('click', (e) => replyComment(e, commentDatas));
  }
}

function deleteComment(){
  const selectedComment = comments.findIndex(x => x.id == this.dataset.id);
  if(selectedComment !== -1){
    comments.splice(selectedComment, 1);
  }
  const selectedReply = replies.findIndex(x => x.id == this.dataset.id);
  if(selectedReply !== -1){
    for (const comment of comments) {
      const parentComment = comment.replies.find(x => x.id == this.dataset.id);
        if(parentComment){
          comment.replies.splice(selectedReply, 1);
        }
    }
    replies.splice(selectedReply, 1);

  }
  renderComments(comments, currentUser);
}

function editComment(e, commentDatas){
  const currentComments = document.querySelectorAll('.comment');
  for (const comment of currentComments) {
    if(e.target.dataset.id == comment.dataset.id){
      comment.classList.toggle('editing');
      const content = document.querySelector(`.editing[data-id="${e.target.dataset.id}"] .content`);
      const updateBtn = document.querySelector(`.update-btn[data-id="${e.target.dataset.id}"]`);
      const textarea = document.querySelector(`.editing[data-id="${e.target.dataset.id}"] .editTextarea`);
      textarea.focus();
      updateBtn.addEventListener('click', () => {
        comment.classList.remove('editing');
        const updatedComment = commentDatas.find(x => x.id == comment.dataset.id);
        updatedComment.content = textarea.value;
        content.innerText = textarea.value;
      })
    }
  }
  const currentReplyContainers = document.querySelectorAll('.reply');
  for (const reply of currentReplyContainers) {
    if(e.target.dataset.id == reply.dataset.id){
      reply.classList.toggle('editing');
      const content = document.querySelector(`.editing[data-id="${e.target.dataset.id}"] .content`);
      const updateBtn = document.querySelector(`.update-btn[data-id="${e.target.dataset.id}"]`);
      const textarea = document.querySelector(`.editing[data-id="${e.target.dataset.id}"] .editTextarea`);
      const updatedReply = replies.find(x => x.id == reply.dataset.id);
      textarea.focus();
      updateBtn.addEventListener('click', () => {
        reply.classList.remove('editing');
        updatedReply.content = textarea.value;
        content.innerHTML = `<span class="replied-to">@${updatedReply.replyingTo}</span> ${textarea.value}`;
      })
    }
  }
}

function replyComment(e, commentDatas){
  const repliedComment = document.querySelector(`.reply-container[data-id="${e.target.dataset.id}"]`);
  const repliedCommentId = commentDatas.find(x => x.id == e.target.dataset.id) || replies.find(x => x.id == e.target.dataset.id);
  repliedComment.innerHTML += `
    <div class="reply">
      <img src="assets${currentUser.image.svg}" alt="Profile Picture">
      <textarea class="reply-textarea" data-id="${repliedCommentId.id}"></textarea>
      <button class="new-reply-btn" data-id="${repliedCommentId.id}">REPLY</button>
    </div>
  `
  const sendReplyBtn = document.querySelector(`.new-reply-btn[data-id="${repliedCommentId.id}"]`);
  const sendReplyTextarea = document.querySelector(`.reply-textarea[data-id="${repliedCommentId.id}"]`);
  sendReplyBtn.addEventListener('click', () => {
    const lastComment = comments[comments.length - 1];
    const lastReply = replies[replies.length - 1];
    const newReply = {
      id: lastComment.id > lastReply.id ? lastComment.id + 1 : lastReply.id + 1,
      content: `${sendReplyTextarea.value}`,
      createdAt: "Just Now",
      score: 0,
      replyingTo: `${repliedCommentId.user.username}`,
      user: {
        image: { 
          png: `/images/${currentUser.username}.png`,
          svg: `/images/${currentUser.username}.svg`,
          webp: `/images/${currentUser.username}.webp`
        },
        username: `${currentUser.username}`
      }
    }
    // repliedCommentId.replies.push(newReply);
    // replies.push(newReply);
    for (const comment of commentDatas) {
      if(comment.id === repliedCommentId.id){
        repliedCommentId.replies.push(newReply);
        replies.push(newReply);
      } else{
        const parentComment = comment.replies.find(x => x.id == repliedCommentId.id);
        if(parentComment){
          comment.replies.push(newReply);
          replies.push(newReply);
        }
      }
    }
    renderComments(comments, currentUser);
  });
}

