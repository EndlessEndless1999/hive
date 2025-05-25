package main

// Task represents an item in a task list
type Task struct {
	status      status
	title       string
	description string
}

// Constructor for creating a new Task
func NewTask(status status, title, description string) Task {
	return Task{status: status, title: title, description: description}
}

// Implement list.Item interface

func (t Task) FilterValue() string {
	return t.title
}

func (t Task) Title() string {
	return t.title
}

func (t Task) Description() string {
	return t.description
}

// func (t *Task) Next() {
// 	if t.status == done {
// 		t.status = todo
// 	} else {
// 		t.status++
// 	}
// }
