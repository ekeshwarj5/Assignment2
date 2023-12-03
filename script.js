document.addEventListener('DOMContentLoaded', fetchData);

const itemsPerPage = 10;
let currentPage = 1;
let users = [];
let selectedUsers = [];

function fetchData() {
  fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Process the data, render the table, and initialize users
      users = data;
      selectedUsers = users; // Initialize selected users with all users
      renderTable(selectedUsers);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

function renderTable(users) {
  const tableBody = document.getElementById('data-container');

  // Clear existing content
  tableBody.innerHTML = '';

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const usersToShow = users.slice(startIndex, endIndex);

  // Render each user in a table row
  usersToShow.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" onclick="selectUser(${user.id})"></td>
      <td>${user.id}</td>
      <td><span id="name_${user.id}">${user.name}</span></td>
      <td><span id="email_${user.id}">${user.email}</span></td>
      <td><span id="role_${user.id}">${user.role}</span></td>
      <td>
        <button onclick="editUser(${user.id})">Edit</button>
        <button onclick="deleteUser(${user.id})">Delete</button>
        <button id="save_${user.id}" style="display: none;" onclick="saveEdit(${user.id})">Save</button>
       <button id="cancel_${user.id}" style="display: none;" onclick="cancelEdit(${user.id})">Cancel</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Render pagination buttons
  renderPagination(users.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationContainer = document.getElementById('pagination-buttons');
  paginationContainer.innerHTML = '';

  // First button
  const firstButton = document.createElement('button');
  firstButton.textContent = '<<';
  firstButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage = 1;
      fetchData();
    }
  });
  paginationContainer.appendChild(firstButton);

  // Previous button
  const previousButton = document.createElement('button');
  previousButton.textContent = '<';
  previousButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchData();
    }
  });
  paginationContainer.appendChild(previousButton);

  // Page buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => {
      currentPage = i;
      fetchData();
    });
    paginationContainer.appendChild(pageButton);
  }

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = '>';
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchData();
    }
  });
  paginationContainer.appendChild(nextButton);

  // Last button
  const lastButton = document.createElement('button');
  lastButton.textContent = '>>';
  lastButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage = totalPages;
      fetchData();
    }
  });
  paginationContainer.appendChild(lastButton);

  // Current page display
  const currentPageDisplay = document.getElementById('currentPageDisplay');
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  currentPageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
}

function editUser(userId) {
  document.getElementById(`save_${userId}`).style.display = 'inline-block';
  document.getElementById(`cancel_${userId}`).style.display = 'inline-block';
  document.getElementById(`name_${userId}`).innerHTML = `<input type="text" id="editName_${userId}" value="${document.getElementById(`name_${userId}`).textContent}">`;
  document.getElementById(`email_${userId}`).innerHTML = `<input type="text" id="editEmail_${userId}" value="${document.getElementById(`email_${userId}`).textContent}">`;
  document.getElementById(`role_${userId}`).innerHTML = `<input type="text" id="editRole_${userId}" value="${document.getElementById(`role_${userId}`).textContent}">`;
}

function saveEdit(userId) {
  const editedName = document.getElementById(`editName_${userId}`).value;
  const editedEmail = document.getElementById(`editEmail_${userId}`).value;
  const editedRole = document.getElementById(`editRole_${userId}`).value;

  document.getElementById(`name_${userId}`).textContent = editedName;
  document.getElementById(`email_${userId}`).textContent = editedEmail;
  document.getElementById(`role_${userId}`).textContent = editedRole;

  document.getElementById(`save_${userId}`).style.display = 'none';
  document.getElementById(`cancel_${userId}`).style.display = 'none';
}

// function cancelEdit(userId) {
//   document.getElementById(`save_${userId}`).style.display = 'none';
//   document.getElementById(`cancel_${userId}`).style.display = 'none';

//   document.getElementById(`name_${userId}`).innerHTML = document.getElementById(`name_${userId}`).textContent;
//   document.getElementById(`email_${userId}`).innerHTML = document.getElementById(`email_${userId}`).textContent;
//   document.getElementById(`role_${userId}`).innerHTML = document.getElementById(`role_${userId}`).textContent;
// }

function deleteUser(userId) {
  selectedUsers = selectedUsers.filter(user => user.id !== userId);
  currentPage = 1;
  renderTable(selectedUsers);
}

function selectUser(userId) {
  const selectedRow = document.getElementById(`row_${userId}`);

  if (selectedRow) {
    if (selectedRow.classList.contains('selected-row')) {
      // Deselect
      selectedRow.classList.remove('selected-row');
    } else {
      // Select
      selectedRow.classList.add('selected-row');
    }
  }
}

function searchUsers() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase();

  selectedUsers = users.filter(user =>
    user.id.toString().includes(searchTerm) ||
    user.name.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm) ||
    user.role.toLowerCase().includes(searchTerm)
  );

  currentPage = 1;
  renderTable(selectedUsers);
}

function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchData();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(selectedUsers.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    fetchData();
  }
}
