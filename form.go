package main

import (
	"github.com/charmbracelet/bubbles/textarea"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// Form model for creating a task
type Form struct {
	focused     status
	title       textinput.Model
	description textarea.Model
}

// Constructor
func NewForm(focused status) *Form {
	form := &Form{focused: focused}
	form.title = textinput.New()
	form.title.Focus()
	form.description = textarea.New()
	return form
}

// CreateTask returns a new Task as a message
func (m Form) CreateTask() tea.Msg {
	task := NewTask(m.focused, m.title.Value(), m.description.Value())
	return task
}

// Initial command (no-op)
func (m Form) Init() tea.Cmd {
	return nil
}

// Update handles keyboard input and focus state
func (m Form) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit
		case "enter":
			if m.title.Focused() {
				m.title.Blur()
				m.description.Focus()
				return m, textarea.Blink
			} else {
				models[form] = m
				models[form] = NewForm(m.focused)
				return models[model], m.CreateTask
			}
		}
	}

	if m.title.Focused() {
		m.title, cmd = m.title.Update(msg)
	} else {
		m.description, cmd = m.description.Update(msg)
	}
	return m, cmd
}

// View renders the form
func (m Form) View() string {
	return lipgloss.JoinVertical(lipgloss.Left, m.title.View(), m.description.View())
}
