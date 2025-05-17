# Deploying Fox Escape to GitHub Pages

This document explains how to complete the GitHub Pages deployment process.

## Step 1: Push to GitHub

First, push your changes to GitHub:

```bash
git push origin main
```

## Step 2: Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** > **Pages**
3. Under "Build and deployment" > "Source", select **GitHub Actions**
4. Wait for the GitHub Actions workflow to complete (check the "Actions" tab)

## Step 3: Access Your Game

Once deployed, your game will be available at:
`https://YOUR-USERNAME.github.io/fox-escape`

## Step 4: Update README

After successful deployment, update the README.md file with the correct URL:

1. Replace `YOUR-USERNAME` with your actual GitHub username in the README.md
2. Commit and push the update:
   ```bash
   git add README.md
   git commit -m "Update game URL in README"
   git push origin main
   ```

## Troubleshooting

If you encounter any issues:

1. Check the GitHub Actions tab for any build errors
2. Make sure your repository is public (GitHub Pages is only available for public repositories on free accounts)
3. Verify the workflow file (.github/workflows/deploy.yml) has the correct configuration

## Manual Deployment

If GitHub Actions doesn't work, you can also deploy manually:

```bash
# Build the project
npm run build

# Create a gh-pages branch
git checkout -b gh-pages

# Copy the dist contents to the root
cp -r dist/* .

# Add and commit
git add .
git commit -m "Manual GitHub Pages deployment"

# Push to the gh-pages branch
git push origin gh-pages

# Switch back to main
git checkout main
```

Then in your repository settings, set the source to "Deploy from a branch" and select the gh-pages branch.