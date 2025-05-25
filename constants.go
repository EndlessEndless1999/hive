package main

// Status for task progress
type status int

const (
	todo status = iota
	// inProgress
	// done
)

// Used to identify which model is currently active
const (
	model status = iota
	form
)

// Layout helper
const divisor = 4
