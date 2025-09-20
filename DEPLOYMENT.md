# 🚀 Deployment & Rollback Guide

## 📋 **Features**

### ✅ **Enhanced Auto-Deployment**
- **Trigger**: Push to `main` branch
- **Clean Deploy**: Automatically deletes and recreates gh-pages branch
- **Fast Updates**: Bypasses CDN cache issues
- **Smart Commits**: Detailed deployment messages with timestamps

### 🔄 **Manual Deployment**
- **Trigger**: Manual workflow dispatch
- **Options**: Deploy from any tag/version or latest main
- **Force Clean**: Option to force clean deployment

### ⏪ **Rollback System**
- **Trigger**: Manual rollback workflow
- **Safety**: Requires "CONFIRM" confirmation
- **Version Control**: Deploy any previous tag/release
- **Tracking**: Creates rollback markers in git history

---

## 🎮 **How to Use**

### 🔧 **Normal Deployment (Automatic)**
1. Make changes to your code
2. Commit and push to `main` branch
3. Deployment automatically triggers
4. Website updates in 2-3 minutes (bypassing cache)

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### 🚀 **Manual Deployment**
1. Go to **Actions** tab in GitHub
2. Click **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** button
4. Options:
   - **Version**: Leave empty for latest, or specify tag (e.g., `v2025.9.1`)
   - **Force Clean**: Keep checked for cache bypass

### ⏪ **Rollback to Previous Version**
1. Go to **Actions** tab in GitHub
2. Click **"Rollback Deployment"** workflow  
3. Click **"Run workflow"** button
4. Enter:
   - **Version**: Tag to rollback to (e.g., `v2025.9.1`)
   - **Confirm**: Type `CONFIRM` exactly
5. Click **"Run workflow"**

---

## 🏷️ **Finding Available Versions**

### Recent Releases:
- `v2025.9.1` - Initial CalVer release
- `v2025.9.2` - Enhanced features release
- (Future releases will follow YYYY.M.ITERATION format)

### Check Available Tags:
```bash
git tag -l --sort=-version:refname
```

---

## ⚡ **Benefits**

### 🚀 **Faster Deployments**
- Clean deployment bypasses CDN cache
- Changes visible in 2-3 minutes instead of 10-15
- Eliminates "website not updating" issues

### 🔄 **Reliable Rollbacks**
- Instant rollback to any previous version
- Safe confirmation system prevents accidents
- Full audit trail of rollbacks

### 🛡️ **Safety Features**
- Confirmation required for rollbacks
- Validates tag exists before proceeding
- Detailed logging and summaries
- Git history preserved

---

## 🎯 **Example Scenarios**

### Scenario 1: Quick Fix Deployment
```bash
# Make urgent fix
git commit -m "🔧 Fix critical issue"
git push origin main
# Automatically deploys with cache bypass
```

### Scenario 2: Deploy Specific Version
1. Go to Actions → "Deploy to GitHub Pages" 
2. Run workflow with version: `v2025.9.1`
3. Deploys that exact version

### Scenario 3: Emergency Rollback
1. Go to Actions → "Rollback Deployment"
2. Version: `v2025.9.1`, Confirm: `CONFIRM`
3. Instantly rolls back to stable version

---

## 📊 **Monitoring**

- **Live Site**: [naathconnect.com](https://naathconnect.com)
- **Direct GitHub**: [afroinnovate.github.io/naathconnect.com](https://afroinnovate.github.io/naathconnect.com)
- **Actions**: Check workflow status in GitHub Actions tab
- **Releases**: View all versions in GitHub Releases tab

---

*🎉 This system gives you enterprise-level deployment control for your static website!*