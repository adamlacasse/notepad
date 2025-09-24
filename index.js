// Sample input data showing various notepad operations
const queries = [
    ["APPEND", "Hi"],
    ["APPEND", " there!"],
    ["MOVE", -600],
    ["MOVE", 6],
    ["BACKSPACE", 3],
    ["INSERT", "Squa"]
];

// Test cases for selection functionality
const selectionQueries = [
    ["APPEND", "Hello World!"],
    ["SELECT", 0, 5],           // Select "Hello"
    ["APPEND", "Hi"],           // Replace "Hello" with "Hi"
    ["SELECT", 3, 8],           // Select "World"
    ["BACKSPACE"],              // Delete selected "World"
    ["SELECT", 2, 2],           // Empty selection at position 2 (becomes cursor)
    ["INSERT", " beautiful"],   // Insert at cursor position
    ["SELECT", -5, 100],        // Test clamping: should select from 0 to end
    ["APPEND", "Greetings!"]    // Replace entire text
];

/*
    Expected output for original queries:
    [
        ["Hi"],
        ["Hi there!"],
        ["Hi re!"],
        ["Hi Square!"]
    ]
    
    Expected output for selection queries:
    [
        ["Hello World!"],
        ["Hi World!"],       // "Hello" replaced with "Hi"
        ["Hi !"],            // "World" deleted
        ["Hi beautiful !"],  // " beautiful" inserted at position 2
        ["Greetings!"]       // Entire text replaced
    ]
*/

/**
 * Simulates a notepad with basic text editing operations including text selection
 * 
 * @param {Array<Array>} inputCommands - Array of command tuples where each tuple contains:
 *   - [0]: command string ("APPEND", "MOVE", "BACKSPACE", "INSERT", "SELECT")
 *   - [1]: value (string for text operations, number for cursor movement, or left position for SELECT)
 *   - [2]: (for SELECT only) right position
 * 
 * @returns {Array<string>} Array of strings representing the notepad state after each operation
 *   that produces a visible change (APPEND, BACKSPACE, INSERT operations)
 * 
 * Commands:
 *   - APPEND: Adds text to the end of current content (or replaces selection if active)
 *   - MOVE: Moves cursor position by specified amount (negative = left, positive = right), deselects if selection active
 *   - BACKSPACE: Deletes specified number of characters to the left of cursor (or deletes selection if active)
 *   - INSERT: Inserts text at current cursor position (or replaces selection if active)
 *   - SELECT: Selects text between left and right positions (automatically clamps to valid range)
 */
function notepad(inputCommands) {
    // Array to store the notepad state after each operation that produces visible changes
    const resultsArray = [];
    // Cursor position tracking (0-based index)
    let cursor = 0;
    // Selection tracking: null means no selection, otherwise {start, end} where start <= end
    let selection = null;

    // Helper function to clamp position to valid range
    function clampPosition(pos, textLength) {
        return Math.max(0, Math.min(pos, textLength));
    }

    // Helper function to clear selection and set cursor
    function clearSelection(newCursor = null) {
        selection = null;
        if (newCursor !== null) {
            cursor = newCursor;
        }
    }

    // Process each command in sequence
    inputCommands.forEach(tuple => {
        const [command, value, rightPos] = tuple; // Destructure command and its parameters
        
        // Skip non-APPEND and non-INSERT and non-SELECT commands if no content exists yet
        if ((command !== "APPEND" && command !== "INSERT" && command !== "SELECT") && resultsArray.length === 0) {
            console.warn(`Skipping '${command}' command - no content exists yet.`);
            return;
        }
            
        // Get the most recent notepad state (or empty string if none exists)
        const lastResult = resultsArray[resultsArray.length -1] || '';

        // Execute the appropriate operation based on command type
        switch (command) {
            case "SELECT":
                // Select text between left (value) and right (rightPos) positions
                const textLength = lastResult.length;
                const leftClamped = clampPosition(value, textLength);
                const rightClamped = clampPosition(rightPos, textLength);
                
                // Ensure left <= right as guaranteed by problem statement
                if (leftClamped === rightClamped) {
                    // Empty selection becomes cursor position
                    selection = null;
                    cursor = leftClamped;
                } else {
                    selection = { start: leftClamped, end: rightClamped };
                    cursor = rightClamped; // Cursor at end of selection
                }
                break;
                
            case "APPEND":
                if (selection) {
                    // Replace selected text with appended text
                    const newText = lastResult.slice(0, selection.start) + value + lastResult.slice(selection.end);
                    resultsArray.push(newText);
                    cursor = selection.start + value.length; // Cursor at end of appended segment
                    clearSelection();
                } else {
                    // Add text to the end of current content and update cursor position
                    resultsArray.push(lastResult + value);
                    cursor = (lastResult + value).length; // Move cursor to end of total text
                }
                break;
                
            case "MOVE":
                // Clear any selection and move cursor by the specified amount
                clearSelection();
                if (cursor + value < 0) {
                    // Prevent cursor from going before start of text
                    cursor = 0;
                } else if (cursor + value > lastResult.length) {
                    // Prevent cursor from going beyond end of text
                    cursor = lastResult.length;
                } else {
                    // Normal cursor movement
                    cursor += value;
                }
                break;
                
            case "BACKSPACE":
                if (selection) {
                    // Delete selected characters
                    const newText = lastResult.slice(0, selection.start) + lastResult.slice(selection.end);
                    resultsArray.push(newText);
                    cursor = selection.start; // Cursor at start of deleted selection
                    clearSelection();
                } else {
                    // Delete 'value' number of characters to the left of cursor
                    const deleteStart = Math.max(0, cursor - value);
                    const newText = lastResult.slice(0, deleteStart) + lastResult.slice(cursor);
                    resultsArray.push(newText);
                    cursor = deleteStart; // Move cursor to deletion point
                }
                break;
                
            case "INSERT":
                if (selection) {
                    // Replace selected text with inserted text
                    const newText = lastResult.slice(0, selection.start) + value + lastResult.slice(selection.end);
                    resultsArray.push(newText);
                    cursor = selection.start + value.length; // Cursor at end of inserted segment
                    clearSelection();
                } else {
                    // Insert text at current cursor position
                    // Handle empty resultsArray case: start new content at index 0
                    if (resultsArray.length === 0) {
                        resultsArray.push(value);
                        cursor = value.length; // Move cursor to end of inserted text
                    } else {
                        // Combine: text before cursor + new text + text after cursor
                        const newText = lastResult.slice(0, cursor) + value + lastResult.slice(cursor);
                        resultsArray.push(newText);
                        cursor += value.length; // Move cursor to end of inserted text
                    }
                }
                break;
                
            default:
                break;
        }
    });
    
    // Return array of all notepad states after operations that changed content
    return resultsArray;
}

// Additional test cases for edge cases
const edgeCaseQueries = [
    ["APPEND", "Test"],
    ["SELECT", -10, 20],        // Out of bounds selection (should clamp to 0,4)
    ["INSERT", "ABC"],          // Replace entire text with "ABC"
    ["SELECT", 1, 1],           // Empty selection at position 1
    ["MOVE", 2],                // Should deselect and move cursor
    ["SELECT", 0, 3],           // Select all of "ABC"
    ["BACKSPACE"]               // Delete all selected text
];

// Test the function with sample input and display results
console.log("Original queries:", notepad(queries));
console.log("Selection queries:", notepad(selectionQueries));
console.log("Edge case queries:", notepad(edgeCaseQueries));

/*
    Expected output for edge case queries:
    [
        ["Test"],           // Initial text
        ["ABC"],            // Entire "Test" replaced with "ABC" (due to out-of-bounds selection)
        [""]                // All text deleted
    ]
*/
