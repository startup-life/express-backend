#!/bin/bash
export NVM_DIR="/var/lib/jenkins/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
nvm use 20

pm2 stop all
pm2 delete all
pm2 start app.js --name "jenkins-app"
pm2 save