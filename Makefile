.PHONY: assets-install assets-build assets-clean

## Install JS dependencies for assets
assets-install:
	cd assets && yarn install

## Build JS/CSS assets into assets/dist/
assets-build: assets-install
	cd assets && yarn build

## Remove node_modules and dist
assets-clean:
	rm -rf assets/node_modules assets/dist
