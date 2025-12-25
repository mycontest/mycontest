# Example Problem Structure

This directory contains example problem files that demonstrate the correct ZIP structure for uploading problems to the platform.

## Directory Structure

```
sample_problem/
├── config.json          # Problem metadata and configuration
├── input/               # Test case inputs
│   ├── 1.txt
│   ├── 2.txt
│   └── 3.txt
└── output/              # Expected outputs
    ├── 1.txt
    ├── 2.txt
    └── 3.txt
```

## Creating a Problem ZIP

### Step 1: Create Directory Structure

```bash
mkdir -p my_problem/input my_problem/output
```

### Step 2: Create config.json

```json
{
  "title": "Problem Title",
  "slug": "problem-slug",
  "difficulty": "easy",
  "problem_type": "python",
  "description": "Problem description here...",
  "template_code": "def solution():\n    pass",
  "time_limit": 1000,
  "memory_limit": 128,
  "points_per_case": 10
}
```

#### Config Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Problem title (3-255 chars) |
| `slug` | string | ❌ | URL-friendly identifier (auto-generated if not provided) |
| `difficulty` | enum | ✅ | One of: `easy`, `medium`, `hard` |
| `problem_type` | enum | ✅ | One of: `python`, `sql`, `pandas`, `cpp`, `java`, `javascript` |
| `description` | string | ❌ | Full problem description (max 10000 chars) |
| `template_code` | string | ❌ | Starter code for users |
| `time_limit` | number | ✅ | Execution time limit in milliseconds (100-30000) |
| `memory_limit` | number | ✅ | Memory limit in MB (32-2048) |
| `points_per_case` | number | ❌ | Points per test case (default: 10) |

### Step 3: Create Test Cases

Create pairs of input/output files:

**input/1.txt**
```
2 3
```

**output/1.txt**
```
5
```

**input/2.txt**
```
10 20
```

**output/2.txt**
```
30
```

### Step 4: Create ZIP File

```bash
cd my_problem
zip -r ../my_problem.zip .
```

Or on Windows:
```bash
# Use 7-Zip or WinRAR to create ZIP
```

### Step 5: Upload

Upload the ZIP file via:
- Admin panel UI
- API endpoint: `POST /api/problems/upload`

```bash
curl -X POST http://localhost:7001/api/problems/upload \
  -F "zip_file=@my_problem.zip" \
  -H "Cookie: session_id=..."
```

## Important Notes

### Naming Conventions

- **Input files**: Must be `.txt` files
- **Output files**: Must be `.txt` files
- **Matching pairs**: Each input file must have a corresponding output file
- **Order**: Files are sorted alphabetically (1.txt, 2.txt, etc.)

### Visibility

- **First 2 test cases**: Visible to users (examples)
- **Remaining test cases**: Hidden until submission

### Validation

The platform automatically validates:
- ✅ config.json exists and is valid JSON
- ✅ input/ and output/ directories exist
- ✅ Equal number of input and output files
- ✅ All required config fields are present
- ✅ Valid problem_type and difficulty values
- ✅ Time and memory limits within bounds

## Example Problems Included

### 1. Two Sum (Python - Easy)
- **Directory**: `sample_problem/`
- **Test Cases**: 3
- **Type**: Array manipulation
- **Difficulty**: Easy

## Testing Your ZIP

Before uploading, you can test the structure:

```bash
# Extract and verify
unzip -l my_problem.zip

# Should show:
# - config.json
# - input/1.txt, input/2.txt, ...
# - output/1.txt, output/2.txt, ...
```

## Common Errors

### ❌ Missing config.json
```
Error: config.json not found in ZIP
```
**Solution**: Ensure config.json is in the root of the ZIP

### ❌ Mismatched test cases
```
Error: Mismatch: 3 input files, 2 output files
```
**Solution**: Create matching input/output pairs

### ❌ Invalid problem_type
```
Error: Invalid problem_type: java_script
```
**Solution**: Use `javascript` not `java_script`

### ❌ Invalid difficulty
```
Error: Invalid difficulty: simple
```
**Solution**: Use `easy`, `medium`, or `hard`

## Need Help?

- Check the main [MASTER_SPEC_README.md](../MASTER_SPEC_README.md)
- Review the sample problem in this directory
- Test your ZIP structure before uploading

---

**Happy Problem Creating! 🎯**
