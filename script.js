// References to DOM elements
const taskInput = document.getElementById("taskInput"); // Input field for adding new tasks
const addTaskButton = document.getElementById("addTaskButton"); // Button to add a new task
const taskList = document.getElementById("taskList"); // List element to display tasks
const clearAllButton = document.getElementById("clearAllTasks"); // Button to clear all tasks
const filterButtons = document.querySelectorAll(".filter-button"); // Filter buttons for task status
const toast = document.getElementById("customToast"); // Toast notification element
const editModal = document.getElementById("editModal"); // Modal for editing tasks
const editTaskInput = document.getElementById("editTaskInput"); // Input field in the edit modal
const saveTaskButton = document.getElementById("saveTaskButton"); // Button to save edited task
const closeModal = document.getElementById("closeModal"); // Button to close the edit modal
const taskCounter = document.getElementById("taskCounter"); // Counter to show completed/total tasks

// Variable to store the index of the task being edited
let taskToEditIndex = null;

// Retrieve tasks from local storage or initialize an empty array
let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (error) {
  console.error("Error parsing tasks from localStorage:", error);
}

// Load tasks and update the counter on page load
window.onload = () => {
  renderTasks(); // Render tasks on the page
  updateTaskCounter(); // Update task counter
};

// Enable or disable the Add Task button based on the input field's value
if (taskInput && addTaskButton) {
  taskInput.addEventListener("input", () => {
    addTaskButton.disabled = !taskInput.value.trim(); // Disable if input is empty
  });

  // Add task using Enter key
  taskInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && taskInput.value.trim()) {
      addTask();
    }
  });
}

// Add a new task to the list
if (addTaskButton) {
  addTaskButton.addEventListener("click", addTask);
}

// Function to handle adding a new task
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText) {
    tasks.push({ text: taskText, completed: false }); // Add new task to the list
    saveTasks(); // Save updated tasks to localStorage
    renderTasks(); // Re-render the task list
    updateTaskCounter(); // Update the task counter
    taskInput.value = ""; // Clear the input field
    console.log("Input cleared. Current value:", taskInput.value); // Debugging
    addTaskButton.disabled = true; // Disable Add Task button
    showToast("Task added successfully!", "success"); // Show success message
  }
}

// Handle task actions using event delegation
taskList.addEventListener("click", (event) => {
  const taskItem = event.target.closest(".task-item"); // Get the task item clicked
  if (!taskItem) return;

  const taskIndex = taskItem.dataset.index; // Get task index
  const task = tasks[taskIndex]; // Get task object

  // Toggle completion status
  if (event.target.classList.contains("complete-btn")) {
    task.completed = !task.completed; // Toggle completed flag
    saveTasks(); // Save updated tasks
    renderTasks(); // Re-render tasks
    updateTaskCounter(); // Update task counter
    showToast(
      task.completed ? "Task completed!" : "Task marked as pending!",
      "info"
    );
  }

  // Open edit modal
  if (event.target.classList.contains("edit-btn")) {
    taskToEditIndex = taskIndex; // Set the task index for editing
    editTaskInput.value = task.text; // Populate modal with task text
    editModal.style.display = "block"; // Show modal
  }

  // Delete task
  if (event.target.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this task?")) {
      taskItem.classList.add("fade-out"); // Add fade-out animation
      setTimeout(() => {
        tasks.splice(taskIndex, 1); // Remove task from the list
        saveTasks(); // Save updated tasks
        renderTasks(); // Re-render tasks
        updateTaskCounter(); // Update task counter
        showToast("Task deleted successfully!", "error"); // Show delete message
      }, 400);
    }
  }
});

// Save task edits
saveTaskButton.addEventListener("click", () => {
  const newText = editTaskInput.value.trim(); // Get edited text
  if (newText) {
    tasks[taskToEditIndex].text = newText; // Update task text
    saveTasks(); // Save updated tasks
    renderTasks(); // Re-render tasks
    updateTaskCounter(); // Update task counter
    showToast("Task edited successfully!", "success"); // Show success message
    editModal.style.display = "none"; // Close modal
  }
});

// Close modal
closeModal.addEventListener("click", () => {
  editModal.style.display = "none";
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === editModal) {
    editModal.style.display = "none";
  }
});

// Clear all tasks
if (clearAllButton) {
  clearAllButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
      tasks = []; // Clear task list
      saveTasks(); // Save cleared tasks
      renderTasks(); // Re-render tasks
      updateTaskCounter(); // Update task counter
      showToast("All tasks cleared!", "info"); // Show clear message
    }
  });
}

// Filter tasks based on the selected filter button
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active")); // Remove active class
    button.classList.add("active"); // Add active class to clicked button
    filterTasks(button.dataset.filter); // Filter tasks
  });
});

// Drag-and-drop functionality for reordering tasks
taskList.addEventListener("dragstart", (event) => {
  event.dataTransfer.setData("text/plain", event.target.dataset.index); // Store task index
});

taskList.addEventListener("dragover", (event) => {
  event.preventDefault(); // Allow drop
});

taskList.addEventListener("drop", (event) => {
  const fromIndex = event.dataTransfer.getData("text/plain"); // Get dragged task index
  const toIndex = event.target.closest(".task-item")?.dataset.index; // Get drop target index
  if (fromIndex && toIndex && fromIndex !== toIndex) {
    const movedTask = tasks.splice(fromIndex, 1)[0]; // Remove dragged task
    tasks.splice(toIndex, 0, movedTask); // Insert task at new position
    saveTasks(); // Save updated tasks
    renderTasks(); // Re-render tasks
  }
});

// Render tasks based on the selected filter
const renderTasks = (filter = "all") => {
  taskList.innerHTML = ""; // Clear task list

  const filteredTasks = tasks.filter((task) =>
    filter === "completed"
      ? task.completed
      : filter === "pending"
      ? !task.completed
      : true
  );

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<p class="no-tasks">No tasks found for "${filter}"</p>`;
    return;
  }

  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`; // Add completed class if applicable
    taskItem.draggable = true; // Make task draggable

    const buttonColor = task.completed ? "#43a047" : "rgb(239, 159, 10)"; // Set button color

    taskItem.innerHTML = `
    <span class="task-text">${index + 1}. ${task.text}</span>
    <div class="task-buttons">
      <button class="complete-btn" style="background-color: ${buttonColor}; color: white;">${
      task.completed ? "Complete" : "Pending"
    }</button>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>`;
    taskItem.dataset.index = index; // Set task index as data attribute
    taskList.appendChild(taskItem); // Add task to the list
  });
};

// Filter tasks based on the selected filter
function filterTasks(filter) {
  renderTasks(filter);
}

// Show a toast notification
function showToast(message, type = "info", duration = 3000) {
  if (!toast) return;

  clearTimeout(toast.dataset.timeoutId); // Clear any existing timeout
  toast.textContent = message; // Set toast message
  toast.className = `custom-toast ${type} show`; // Add toast type and show class

  const timeoutId = setTimeout(() => {
    toast.classList.remove("show"); // Hide toast after duration
  }, duration);

  toast.dataset.timeoutId = timeoutId; // Store timeout ID
}

// Save tasks to local storage
const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks)); // Save tasks as JSON
};

// Update the task counter
const updateTaskCounter = () => {
  const completedTasks = tasks.filter((task) => task.completed).length; // Count completed tasks
  const totalTasks = tasks.length; // Total tasks
  taskCounter.textContent = `Completed: ${completedTasks}/${totalTasks}`; // Update counter text
};
