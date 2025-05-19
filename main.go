package main

import (
	"fmt"
	"os"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type status int

const divisor = 4

const (
	todo status = iota
	inProgress
	done
)

// STYLING

var (
	columnStyle = lipgloss.NewStyle().
			Padding(1, 2)
	focusedStyle = lipgloss.NewStyle().
			Padding(1, 2).
			Border(lipgloss.RoundedBorder()).
			BorderForeground(lipgloss.Color("62"))
	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("241"))
)

/* Item Class */

type Task struct {
	status      status
	title       string
	description string
}

// list.Item interface implementation

func (t Task) FilterValue() string {
	return t.title
}

func (t Task) Title() string {
	return t.title
}

func (t Task) Description() string {
	return t.description
}

// Main Model

type Model struct {
	focused  status
	lists    []list.Model
	err      error
	loaded   bool
	quitting bool
}

// Constructor method that returns a pointer to new Model instance - * is a pointer
// &Model{} creates a new instance of Model with default values
func New() *Model {
	return &Model{}
}

// / Go to next list
func (m *Model) Next() {
	if m.focused == done {
		m.focused = todo
	} else {
		m.focused++
	}

}

// Go to prev list
func (m *Model) Previous() {
	if m.focused == todo {
		m.focused = done
	} else {
		m.focused--
	}
}

// call this on tea.WindowSizeMSg
func (m *Model) initLists(width, height int) {
	defaultList := list.New([]list.Item{}, list.NewDefaultDelegate(), width/divisor, height/2)

	// Not sure about this
	defaultList.SetShowHelp(false)

	m.lists = []list.Model{defaultList, defaultList, defaultList}

	// Init the To Dos

	m.lists[todo].Title = "Hive Menu"
	m.lists[todo].SetItems([]list.Item{
		Task{status: todo, title: "View Tracks", description: "Look into the hole."},
		Task{status: todo, title: "Add Track", description: "Burrow Deeper."},
		Task{status: todo, title: "Help", description: "Look up."},
	})

	// Init in progress
	m.lists[inProgress].Title = "In Progress"
	m.lists[inProgress].SetItems([]list.Item{
		Task{status: todo, title: "View Tracks", description: "Look into the hole."},
		Task{status: todo, title: "Add Track", description: "Burrow Deeper."},
		Task{status: todo, title: "Help", description: "Look up."},
	})

	// Init Done
	m.lists[done].Title = "Done"
	m.lists[done].SetItems([]list.Item{
		Task{status: todo, title: "View Tracks", description: "Look into the hole."},
		Task{status: todo, title: "Add Track", description: "Burrow Deeper."},
		Task{status: todo, title: "Help", description: "Look up."},
	})

}

func (m Model) Init() tea.Cmd {
	return nil
}

// method of model - Update (message argument) (two return types in brackets)
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
		case "left", "h":
			m.Previous()
		case "right", "l":
			m.Next()
		}

	}

	var cmd tea.Cmd
	m.lists[m.focused], cmd = m.lists[m.focused].Update(msg)
	return m, cmd
}

func (m Model) View() string {
	if m.quitting {
		return ""
	}
	if m.loaded {
		todoView := m.lists[todo].View()
		inProgressView := m.lists[inProgress].View()
		doneView := m.lists[done].View()

		switch m.focused {
		case inProgress:
			return lipgloss.JoinHorizontal(
				lipgloss.Left,
				columnStyle.Render(todoView),
				focusedStyle.Render(inProgressView),
				columnStyle.Render(doneView),
			)
		case done:
			return lipgloss.JoinHorizontal(
				lipgloss.Left,
				columnStyle.Render(todoView),
				columnStyle.Render(inProgressView),
				focusedStyle.Render(doneView),
			)
		default:
			return lipgloss.JoinHorizontal(
				lipgloss.Left,
				focusedStyle.Render(todoView),
				columnStyle.Render(inProgressView),
				columnStyle.Render(doneView),
			)
		}

	} else {
		return "loading..."
	}

}

func main() {
	m := New()
	p := tea.NewProgram(m)
	if _, err := p.Run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
