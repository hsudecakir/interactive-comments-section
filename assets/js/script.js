const container = document.querySelector('.container');
let comments = [];
let replies = [];
let currentUser;

async function init() {
  const data = await fetch('assets/json/data.json').then(res => res.json());
  currentUser = data.currentUser.username;
  render(data, currentUser);
  // comments.push(data);
  for (const comment of data.comments) {
    comments.push(comment);
  }
  addCurrentUserClass(data);
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
                <div class="reply-btn" data-id="${comment.id}">
                  <i class="fa-solid fa-reply"></i>
                  <p>Reply</p>
                </div>
                <div class="delete-btn" data-id="${comment.id}">
                  <i class="fa-solid fa-trash"></i>
                  <p>Delete</p>
                </div>
                <div class="edit-btn" data-id="${comment.id}">
                  <i class="fa-solid fa-pen"></i>
                  <p>Edit</p>
                </div>
              </div>
            </div>
            <p class="content">${comment.content}</p>
            ${currentUser == comment.user.username ? '<textarea class="editTextarea"></textarea><div class="update-btn-container"><button class="update-btn">UPDATE</button></div>' : ''}
          </div>
        </div>
        ${"replies" in comment && comment.replies.length > 0 ? `<div class="reply-container" data-id="${comment.id}"></div>` : ''}
      </div>
    `
  }
  bindDeleteBtns();
  const editBtns = document.querySelectorAll('.edit-btn');
  for (const editBtn of editBtns) {
    editBtn.addEventListener('click', (e) => editComment(e, commentDatas));
  } 
}

function renderReplies(commentDatas, currentUser){
  const replyContainers = document.querySelectorAll('.reply-container');
  for (const replyContainer of replyContainers) {
    const repliedComments = commentDatas.comments.find(x => x.id == replyContainer.dataset.id);
    for (const repliedComment of repliedComments.replies) {
      replyContainer.innerHTML += `
      <div class="reply" data-username="${repliedComment.user.username}">
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
      <div class="reply-btn" data-id="${repliedComment.id}">
      <i class="fa-solid fa-reply"></i>
      <p>Reply</p>
      </div>
      <div class="delete-btn" data-id="${repliedComment.id}">
      <i class="fa-solid fa-trash"></i>
      <p>Delete</p>
      </div>
      <div class="edit-btn" data-id="${repliedComment.id}">
      <i class="fa-solid fa-pen"></i>
      <p>Edit</p>
      </div>
      </div>
      </div>
      <p class="content">
      <span class="replied-to">@${repliedComment.replyingTo}</span>
      ${repliedComment.content}
      </p>
      </div>
      </div>
      `
    }
  }
  addCurrentUserClass(commentDatas);
  bindDeleteBtns();
  const editBtns = document.querySelectorAll('.edit-btn');
  for (const editBtn of editBtns) {
    editBtn.addEventListener('click', (e) => editComment(e, commentDatas));
  }
}

function addCurrentUserClass(commentDatas){
  currentUser = commentDatas.currentUser.username;
  const replies = document.querySelectorAll('.reply');
  const comments = document.querySelectorAll('.comment');
  for (const reply of replies) {
    if(reply.dataset.username == currentUser){
      reply.classList.add('current-user');
    }
  }
  for (const comment of comments) {
    if(comment.dataset.username == currentUser){
      comment.classList.add('current-user');
    }
  }
}

function addComment(e, commentDatas){
  for (const comment of comments) {
    replies.push(comment.replies);
  }
  if(addCommentTextarea.value.trim() !== ''){
    comments.push(
      {
        id: comments.length + replies.length + 1,
        content: `${addCommentTextarea.value}`,
        createdAt: "Just now",
        score: 0,
        user: {
          image: {
            png: `/images/${commentDatas.currentUser.username}.png`,
            svg: `/images/${commentDatas.currentUser.username}.svg`,
            webp: `/images/${commentDatas.currentUser.username}.webp`
          },
          username: `${commentDatas.currentUser.username}`
        },
        replies: []
      }
    )
    addCommentTextarea.value = '';
  }
  renderComments(comments, currentUser);
  renderReplies(commentDatas);
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

function deleteComment(){
  const selectedComment = comments.findIndex(x => x.id == this.dataset.id);
  comments.splice(selectedComment, 1);
  const selectedReply = replies.findIndex(x => x.id == this.dataset.id);
  replies.splice(selectedReply, 1);
  // renderComments(comments.comments);
  console.log(comments);
  // renderReplies(comments);
}

function editComment(e, commentDatas){
  const currentComments = document.querySelectorAll('.comment');
  for (const comment of currentComments) {
    console.log(currentComments);
    if(e.target.dataset.id == comment.dataset.id){
      comment.classList.add('editing');
      const content = document.querySelector('.editing .content');
      const updateBtn = document.querySelector('.update-btn');
      updateBtn.addEventListener('click', () => {
        console.log(comment);
        const textarea = document.querySelector('.editing .editTextarea')
        comment.classList.remove('editing');
        const updatedComment = commentDatas.find(x => x.id == comment.dataset.id);
        updatedComment.content = textarea.value;
        content.innerText = textarea.value;
      })
      return;
    }
    
  }
  console.log(comments);
}

