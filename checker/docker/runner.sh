#!/bin/bash

TEST_COUNT=$1
MAIN_DIR=$2
SCRIPT_COMPILATION=$3
SCRIPT_RUN=$4
TIMEOUT_LIMIT=$5

INPUT_PREFIX="input"
OUTPUT_PREFIX="output"
INFO_LOG="info.log"
ERROR_LOG="error.log"

log_result() {
    local STATUS=$1
    local MESSAGE=$2
    local TEST_NUM=$3
    local TIME_RUN=$4

    echo "{\"status\": \"$STATUS\", \"message\": \"$MESSAGE\", \"time_run\": \"$TIME_RUN\", \"test_number\": $TEST_NUM}"
    echo "$MESSAGE" >> "${MAIN_DIR}/${INFO_LOG}"
}

# Compile the program if needed
if [ -n "$SCRIPT_COMPILATION" ] && [ "$SCRIPT_COMPILATION" != "-" ]; then
    cd ${MAIN_DIR} && ${SCRIPT_COMPILATION} > $ERROR_LOG 2> $ERROR_LOG
    COMPILATION_EXIT_CODE=$?
    if [ $COMPILATION_EXIT_CODE -ne 0 ]; then
        log_result "compilation" "Compilation failed with exit code $COMPILATION_EXIT_CODE." 0 0
        exit 0
    fi
fi

# Running tests
for ((i=1; i<=TEST_COUNT; i++)); do
    INPUT_FILE="${MAIN_DIR}/${INPUT_PREFIX}${i}.txt"
    TEMP_INPUT="${MAIN_DIR}/input.txt"
    TEMP_OUTPUT="${MAIN_DIR}/output.txt"
    FINAL_OUTPUT="${MAIN_DIR}/${OUTPUT_PREFIX}${i}.txt"
    FILE_LOG="${MAIN_DIR}/info${i}.log"

    # Copy test input{i}.txt to input.txt
    cp "${INPUT_FILE}" "${TEMP_INPUT}"

    START_TIME=$(date +%s%3N)

    cd ${MAIN_DIR} && timeout $((TIMEOUT_LIMIT / 1000))s /usr/bin/time -v ${SCRIPT_RUN} < "${TEMP_INPUT}" > "${TEMP_OUTPUT}" 2> "${FILE_LOG}"
    EXIT_CODE=$?

    END_TIME=$(date +%s%3N)
    TIME_RUN=$((END_TIME - START_TIME))

    # Move output.txt to output{i}.txt
    mv "${TEMP_OUTPUT}" "${FINAL_OUTPUT}"

    case $EXIT_CODE in
        124)
            log_result "timeout" "Test $i timed out after ${TIMEOUT_LIMIT} seconds." $i $TIME_RUN
            exit 0
            ;;
        125)
            log_result "timeout" "Test $i failed due to a timeout error." $i $TIME_RUN
            exit 0
            ;;
        0)
            log_result "success" "Test $i completed successfully." $i $TIME_RUN
            ;;
        *)
            log_result "runtime" "Test $i encountered a runtime error with exit code $EXIT_CODE." $i $TIME_RUN
            exit 0
            ;;
    esac
done
