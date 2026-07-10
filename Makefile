.PHONY: assets-install assets-build assets-test assets-clean

## Install JS dependencies for assets
assets-install:
	cd assets && yarn install

## Build JS/CSS assets into assets/dist/
assets-build: assets-install
	cd assets && yarn build

## Run unit tests for assets
assets-test: assets-install
	cd assets && yarn vitest --run

## Remove node_modules and dist
assets-clean:
	rm -rf assets/node_modules assets/dist
