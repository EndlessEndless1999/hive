package main

import (
	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// Slice to hold active models
var models []tea.Model

// Model represents the main list view
type Model struct {
	focused  status
	lists    []list.Model
	loaded   bool
	quitting bool
}

// Constructor
func New() *Model {
	return &Model{}
}

// Called to move a task to the next list (logic commented out)
func (m *Model) MoveToNext() tea.Msg {
	selectedItem := m.lists[m.focused].SelectedItem()
	selectedTask := selectedItem.(Task)
	m.lists[selectedTask.status].RemoveItem(m.lists[m.focused].Index())
	// selectedTask.Next()
	m.lists[selectedTask.status].InsertItem(len(m.lists[selectedTask.status].Items())-1, list.Item(selectedTask))
	return nil
}

// func (m *Model) Next() {}
// func (m *Model) Previous() {}

// Initializes the task lists
func (m *Model) initLists(width, height int) {
	defaultList := list.New([]list.Item{}, list.NewDefaultDelegate(), width/divisor, height/2)
	defaultList.SetShowHelp(false)
	m.lists = []list.Model{defaultList}

	m.lists[todo].Title = "Hive Menu"
	m.lists[todo].SetItems([]list.Item{
		Task{status: todo, title: "View Tracks", description: "Look into the hole."},
		Task{status: todo, title: "Add Track", description: "Burrow Deeper."},
		Task{status: todo, title: "Help", description: "Look up."},
	})
}

// Initial command (no-op)
func (m Model) Init() tea.Cmd {
	return nil
}

// Handles messages and updates list state
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		if !m.loaded {
			columnStyle.Width(msg.Width / divisor)
			focusedStyle.Width(msg.Width / divisor)
			columnStyle.Height(msg.Height - divisor)
			focusedStyle.Height(msg.Height - divisor)
			m.initLists(msg.Width, msg.Height)
			m.loaded = true
		}
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			m.quitting = true
			return m, tea.Quit
		// case "left", "h":
		// 	m.Previous()
		// case "right", "l":
		// 	m.Next()
		case "r":
			return m, m.MoveToNext
		case "n":
			models[model] = m
			return models[form].Update(nil)
		}
	case Task:
		task := msg
		return m, m.lists[task.status].InsertItem(len(m.lists[task.status].Items()), task)
	}

	var cmd tea.Cmd
	m.lists[m.focused], cmd = m.lists[m.focused].Update(msg)
	return m, cmd
}

// Renders the list view
func (m Model) View() string {
	if m.quitting {
		return ""
	}
	if m.loaded {
		todoView := m.lists[todo].View()
		// inProgressView := m.lists[inProgress].View()
		// doneView := m.lists[done].View()

		switch m.focused {
		// case inProgress:
		// case done:
		default:
			return lipgloss.JoinHorizontal(
				lipgloss.Left,
				focusedStyle.Render(todoView),
				// columnStyle.Render(inProgressView),
				// columnStyle.Render(doneView),
			)
		}
	} else {
		return "loading..."
	}
}
