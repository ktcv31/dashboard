// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Create a task card
function createTaskCard(task) {
  const taskCard = $(`
    <div class="card mb-3 task-card" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p>
        <button class="btn btn-warning btn-sm edit-task">Edit</button>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);

  if (dayjs().isAfter(task.deadline)) {
    taskCard.addClass('bg-danger text-white');
  } else if (dayjs().isAfter(dayjs(task.deadline).subtract(1, 'day'))) {
    taskCard.addClass('bg-warning');
  }

  taskCard.draggable({
    revert: "invalid",
    start: function (event, ui) {
      $(this).css('z-index', 100);
    },
    stop: function (event, ui) {
      $(this).css('z-index', 1);
    }
  });

  return taskCard;
}

// Render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard);
  });
}

// Handle adding or editing a task
function handleSaveTask(event) {
  event.preventDefault();

  const id = $('#task-id').val();
  const title = $('#task-title').val();
  const description = $('#task-description').val();
  const deadline = $('#task-deadline').val();

  if (!title || !deadline) {
    alert('Title and deadline are required!');
    return;
  }

  if (id) {
    // Edit existing task
    const task = taskList.find(task => task.id == id);
    task.title = title;
    task.description = description;
    task.deadline = deadline;
  } else {
    // Add new task
    const task = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      status: 'todo'
    };
    taskList.push(task);
  }

  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));

  renderTaskList();
  $('#formModal').modal('hide');
  $('#task-form')[0].reset();
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('id');
  taskList = taskList.filter(task => task.id !== taskId);

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Handle editing a task
function handleEditTask(event) {
  const taskId = $(event.target).closest('.task-card').data('id');
  const task = taskList.find(task => task.id === taskId);

  $('#task-id').val(task.id);
  $('#task-title').val(task.title);
  $('#task-description').val(task.description);
  $('#task-deadline').val(task.deadline);

  $('#formModal').modal('show');
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('id');
  const newStatus = $(this).attr('id').replace('-cards', '');

  const task = taskList.find(task => task.id === taskId);
  task.status = newStatus;

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

$(document).ready(function () {
  renderTaskList();

  // Handle the save action for adding or editing tasks
  $('#task-form').on('submit', handleSaveTask);

  // Handle delete button click
  $(document).on('click', '.delete-task', handleDeleteTask);

  // Handle edit button click
  $(document).on('click', '.edit-task', handleEditTask);

  // Make the cards droppable within the lanes
  $('.lane .card-body').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  // Initialize the date picker for the deadline input
  $('#task-deadline').datepicker({ dateFormat: 'yy-mm-dd' });

  // Reset the form when the modal is shown
  $('#formModal').on('show.bs.modal', function () {
    $('#task-form')[0].reset();
    $('#task-id').val('');
  });
});

