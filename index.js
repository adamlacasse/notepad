// Sample input data showing various notepad operations
const input =
    [
        ["APPEND", "Hi"],
        ["APPEND", " there!"],
        ["MOVE", -600],
        ["MOVE", 6],
        ["BACKSPACE", 3],
        ["INSERT", "Squa"]
    ]
/*
    Expected output
    [
        ["Hi"],
        ["Hi there!"],
        ["Hi re!"],
        ["Hi Square!"]
    ]
*/

/**
 * Simulates a notepad with basic text editing operations
 * 
 * @param {Array<Array>} inputCommands - Array of command tuples where each tuple contains:
 *   - [0]: command string ("APPEND", "MOVE", "BACKSPACE", "INSERT")
 *   - [1]: value (string for text operations, number for cursor movement)
 * 
 * @returns {Array<string>} Array of strings representing the notepad state after each operation
 *   that produces a visible change (APPEND, BACKSPACE, INSERT operations)
 * 
 * Commands:
 *   - APPEND: Adds text to the end of current content
 *   - MOVE: Moves cursor position by specified amount (negative = left, positive = right)
 *   - BACKSPACE: Deletes specified number of characters to the left of cursor
 *   - INSERT: Inserts text at current cursor position (can start new content if notepad is empty)
 */
function notepad(inputCommands) {
    // Array to store the notepad state after each operation that produces visible changes
    const resultsArray = [];
    // Cursor position tracking (0-based index)
    let cursor = 0;

    // Process each command in sequence
    inputCommands.forEach(tuple => {
        const [command, value] = tuple; // Destructure command and its parameter
        
        // Skip non-APPEND and non-INSERT commands if no content exists yet
        if ((command !== "APPEND" && command !== "INSERT") && resultsArray.length === 0) {
            console.warn(`Skipping '${command}' command - no content exists yet.`);
            return;
        }
            
        // Get the most recent notepad state (or empty string if none exists)
        const lastResult = resultsArray[resultsArray.length -1] || '';

        // Execute the appropriate operation based on command type
        switch (command) {
            case "APPEND":
                // Add text to the end of current content and update cursor position
                resultsArray.push(lastResult + value)
                cursor = (lastResult + value).length; // Move cursor to end of total text
                break;
                
            case "MOVE":
                // Move cursor by the specified amount (can be negative or positive)
                if (cursor + value < 0) {
                    // Prevent cursor from going before start of text
                    cursor = 0;
                } else if (cursor + value > lastResult.length -1) {
                    // Prevent cursor from going beyond end of text
                    cursor = lastResult.length -1;
                } else {
                    // Normal cursor movement
                    cursor += value;
                }
                break;
                
            case "BACKSPACE":
                // Delete 'value' number of characters to the left of cursor
                // Combine text before deletion point with text after cursor
                const pushMe = lastResult.slice(0, cursor - value) + lastResult.slice(cursor, lastResult.length);
                resultsArray.push(pushMe);

                cursor -= value; // Move cursor left by number of deleted characters
                break;
                
            case "INSERT":
                // Insert text at current cursor position
                // Handle empty resultsArray case: start new content at index 0
                if (resultsArray.length === 0) {
                    resultsArray.push(value);
                    cursor = value.length; // Move cursor to end of inserted text
                } else {
                    // Combine: text before cursor + new text + text after cursor
                    resultsArray.push(lastResult.slice(0, cursor) + value + lastResult.slice(cursor, lastResult.length))
                    cursor += value.length; // Move cursor to end of inserted text
                }
                break;
                
            default:
                break;
        }
    });
    
    // Return array of all notepad states after operations that changed content
    return resultsArray;
}

// Test the function with sample input and display results
console.log(notepad(input));
