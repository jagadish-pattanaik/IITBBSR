mkdir -p src/{components,contexts,hooks,pages,services,utils}
mkdir -p src/assets/{images,icons,sounds}

# Create necessary files
touch src/services/firebase.js
touch src/contexts/AuthContext.js
touch src/utils/firebaseConfig.js
touch .env

# Add environment variables template
echo "REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=" > .env.example

# Add gitignore entries
echo "
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Firebase
.firebase/
firebase-debug.log" > .gitignore

# Make script executable
chmod +x setup-structure.sh 