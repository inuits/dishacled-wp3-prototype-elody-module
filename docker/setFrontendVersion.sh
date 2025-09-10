# Define the file path
file_path="./public/pwa-version.json"

# Check if the file exists
if [ -f "$file_path" ]; then
    # Use sed to modify the file
    sed -i "s/development-version/${IMAGE_TAG}/" "$file_path"
    echo "Frontend version set to ${IMAGE_TAG}"
else
    # Fallback logic if the file doesn't exist
    echo "File does not exist. Creating a new file with default content."
    echo "{\"elody-pwa-version\": \"${IMAGE_TAG}\"}" > "$file_path"
fi
