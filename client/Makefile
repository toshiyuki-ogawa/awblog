

dist: base-dist ui-dist

.PHONY: dist

lint: base-lint ui-lint

.PHONY: lint


base-dist:
	$(MAKE) -C base update-dist

.PHONY: base-dist

ui-dist:
	$(MAKE) -C ui update-dist

.PHONY: ui-dist

base-lint:
	$(MAKE) -C base lint

.PHONY: base-dist

ui-lint:
	$(MAKE) -C ui lint

.PHONY: ui-lint

ui-index-entries-json:
	$(MAKE) -C ui index-entries.json

.PHONY: ui-index-entries-json

# vi: se ts=4 sw=4 noet:
