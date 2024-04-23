setup: 
	sudo curl -sSL http://bit.ly/2ysbOFE | bash -s -- 2.2.2 1.4.9
	cd ./fabcar/javascript && sudo npm install
start:
	cd fabcar && ./networkDown.sh && ./startFabric.sh javascript
	cd ./fabcar/javascript && node enrollAdmin.js && node registerUser.js && npm start
add:
	git add -A
	git commit -s -m "$(m)"
	git push