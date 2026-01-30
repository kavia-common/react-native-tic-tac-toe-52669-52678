.PHONY: install start lint

install:
	cd tic_tac_toe_frontend && npm install

start:
	cd tic_tac_toe_frontend && npm run start

lint:
	cd tic_tac_toe_frontend && npm run lint
