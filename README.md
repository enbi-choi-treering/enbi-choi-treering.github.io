# En-Bi Choi academic homepage

## Final deployment package

This folder is the GitHub Pages source. Copy the **contents of this folder** into the root of your `YOUR-GITHUB-USERNAME.github.io` repository. Do not upload any surrounding preview or working folders.

Before the first public push, only three personal items normally need attention:

1. Add the square color profile photo you intentionally want to publish and point `index.html` to it.
2. Replace `google_scholar: "#"` in `_config.yml` with your public Google Scholar profile URL.
3. Add a contact email only if you intentionally want it visible on the public web.


A lightweight GitHub Pages / Jekyll academic homepage designed for simple maintenance without editing page HTML.

## What you normally edit

Most updates happen inside `_data/`:

- `_data/publications.yml` — papers and publication news
- `_data/education.yml` — education and training
- `_data/experience.yml` — positions / professional experience
- `_data/funding.yml` — research funding
- `_data/projects.yml` — research projects
- `_data/awards.yml` — awards
- `_data/skills.yml` — research skills

The page design is in `assets/css/style.css`. You usually do not need to edit it.

## Before publishing

1. Replace `assets/images/profile-placeholder.svg` with your square color profile photo. The website crops it into a circle automatically. The easiest method is to save your image as `profile.jpg`, then change the image path in `index.html` from `profile-placeholder.svg` to `profile.jpg`.
2. Add your Google Scholar URL in `_config.yml` at `google_scholar:`.
3. Check your preferred contact email in `_config.yml`.
4. Replace publication URLs currently shown as `#` with DOI / journal links.

## How publication updates work

Add a record to `_data/publications.yml`:

```yaml
- year: 2027
  title: "Your paper title"
  authors: "Choi, E.-B., ..."
  journal: "Journal Name"
  topics: ["isotope", "climate"]
  url: "https://doi.org/..."
  show_in_news: true
  news_date: "2027.03.15"
  news_text: "Published a new paper in Journal Name."
```

The site will automatically:

- add it to Publications
- group it under the correct year
- update the paper count
- include it in topic filters
- add it to Home > News when `show_in_news: true`

## News categories

Home News is automatically assembled from four sources:

- PUBLICATION — `_data/publications.yml`
- FUNDING — `_data/funding.yml`
- AWARD — `_data/awards.yml`
- POSITION — `_data/experience.yml`

To show an item in News, set:

```yaml
show_in_news: true
news_date: "YYYY.MM.DD"
news_text: "Short update text."
```

The newest items appear first. Home shows 5 items. If more than 5 News items exist, a `Show more` button appears and reveals 5 more items at a time.

## GitHub Desktop publishing workflow

Once the repository is connected to GitHub:

1. Edit a YAML file in `_data/`.
2. Save it.
3. Open GitHub Desktop.
4. Check the changed file.
5. Write a short Summary, for example `Add new publication`.
6. Click `Commit to main`.
7. Click `Push origin`.

GitHub Pages will rebuild the website automatically.

## GitHub Pages setup

For the simplest personal site, create a repository named:

`YOUR-GITHUB-USERNAME.github.io`

Copy this project into that repository, commit, and push. In GitHub repository settings, open **Pages** and choose deployment from the `main` branch if it is not already enabled.

### Date display
News dates are displayed as `YYYY.MM` (year and month only). You may still enter a full date such as `2026.04.08` in the data file; the site uses it for sorting but displays only `2026.04`.

## Privacy and security before every push

This repository must contain only files that are safe to publish on the open web.

- Never place a GitHub password, personal access token, API key, recovery code, SSH/private key, or `.env` file in this folder.
- GitHub Desktop handles account authentication separately; no login information belongs in the website files.
- Keep original/private photos outside this repository. Add only the single profile image you intentionally want the public to see.
- Before adding a profile photo, export a web copy and remove unnecessary metadata (EXIF/GPS) if present.
- The contact email is blank by default. Add an address to `_config.yml` only if you intentionally want it public.
- LinkedIn, ResearchGate, and Google Scholar links are public-facing profile links by design. Do not replace them with private account-management URLs.
- Keep CV source files, spreadsheets, PDFs, grant drafts, and other private working documents outside this repository. Common office/PDF file types are ignored by `.gitignore` as an extra safeguard.
- Before pushing, review the **Changes** list in GitHub Desktop. If an unfamiliar/private file appears, uncheck/remove it before committing.

### Recommended public profile photo workflow

1. Keep the original photo in a folder outside the repository.
2. Make a separate web copy, for example `profile-public.jpg`.
3. Crop/resize the copy as needed and remove location metadata.
4. Put only `profile-public.jpg` in `assets/images/`.
5. Point `index.html` to that public copy.

Important: `.gitignore` prevents new matching files from being added accidentally, but it does not make a file private after it has already been committed. Never commit a secret even temporarily.
