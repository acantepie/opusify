SHELL := /bin/bash

.PHONY: help create-env build-linux build-windows

help: ## Outputs this help screen
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

create-env: ## Create python3 virtual env
	python -m virtualenv venv -p 3.10.8
	source venv/bin/activate && pip install -r requirements.txt

build-linux: ## Build library
	source venv/bin/activate && pyinstaller youtube-dl.py \
		--workpath "/tmp" \
		--collect-all "ytmusicapi" \
		--clean \
		--distpath "./dist/linux" \
		--paths "venv/lib/python3.10/site-packages" \
		-F

build-windows:
	docker run --rm \
		-v "${PWD}":/src \
		-w /src \
		tobix/pywine:3.10 \
		/bin/bash -c "wine pip install -r requirements.txt && wine pyinstaller --collect-data ytmusicapi --clean --workpath /tmp --distpath dist/windows -F youtube-dl.py && chown -R --reference=. ./dist"
