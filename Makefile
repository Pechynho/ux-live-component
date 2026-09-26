.PHONY: assets-install assets-build assets-test assets-clean

# Yarn 1 — global binary if available, otherwise via npx
YARN ?= $(shell command -v yarn 2>/dev/null || echo npx -y yarn@1)

## Install JS dependencies for assets
assets-install:
	cd assets && $(YARN) install

## Build JS/CSS assets into assets/dist/
assets-build: assets-install
	cd assets && $(YARN) build

## Run unit tests for assets
assets-test: assets-install
	cd assets && $(YARN) test:unit

## Remove node_modules and dist
assets-clean:
	rm -rf assets/node_modules assets/dist
