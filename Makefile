TOOLS_CONTAINER_NAME ?= gimlijs-tools
TOOLS_CONTAINER_REGISTRY ?= drgrove
TOOLS_CONTAINER_VERSION := latest
OUT_DIR ?= out
TOOLS_IMAGE_DIR ?= $(OUT_DIR)/tools
SRCS=$(shell find . -type f -name "*.ts" -not -path "*/\.*")
SOURCE_URL=https://github.com/drGrove/gimli.js
TOOLS_DESCRIPTION='Tools for developing and building gimli.js'
PLATFORM=linux/amd64

SOURCE_DATE_EPOCH := $(shell git log -1 --format=%ct)
COMMIT_ISO := $(shell git log -1 --format=%cI)

TOOLS_CONTAINERFILE = Containerfile.tools
TOOLS_SOURCE_DATE_EPOCH := $(shell git log -1 --format=%ct -- $(TOOLS_CONTAINERFILE))
TOOLS_COMMIT_ISO := $(shell git log -1 --format=%cI -- $(TOOLS_CONTAINERFILE))
TOOLS_REVISION := $(shell git rev-list HEAD -1 -- $(TOOLS_CONTAINERFILE))

export SOURCE_DATE_EPOCH
export TZ=UTC
export LANG=C.UTF-8
export LC_ALL=C
export BUILDKIT_MULTI_PLATFORM=1
export DOCKER_BUILDKIT=1

$(OUT_DIR):
	mkdir -p $@

$(TOOLS_IMAGE_DIR): $(OUT_DIR)
	mkdir -p $@


ifeq ($(NOCACHE), 1)
NOCACHE_FLAG=--no-cache
else
NOCACHE_FLAG=
endif
export NOCACHE_FLAG

.PHONY: tools
tools: $(TOOLS_IMAGE_DIR)/index.json
$(TOOLS_IMAGE_DIR)/index.json: $(TOOLS_CONTAINERFILE) $(TOOLS_IMAGE_DIR) $(SRCS)
	SOURCE_DATE_EPOCH=$(TOOLS_SOURCE_DATE_EPOCH) \
	docker \
		buildx \
		build \
		--ulimit nofile=2048:16384 \
		--tag $(TOOLS_CONTAINER_REGISTRY)/$(TOOLS_CONTAINER_NAME):$(TOOLS_CONTAINER_VERSION) \
		--output \
			name=$(TOOLS_CONTAINER_REGISTRY)/$(TOOLS_CONTAINER_NAME),type=oci,rewrite-timestamp=true,force-compression=true,annotation.org.opencontainers.image.revision=$(TOOLS_REVISION),annotation.org.opencontainers.source=$(SOURCE_URL),annotation.org.opencontainers.image.created=$(TOOLS_COMMIT_ISO),annotation.org.opencontainers.description=$(TOOLS_DESCRIPTION),tar=true,dest=- \
		$(EXTRA_ARGS) \
		$(NOCACHE_FLAG) \
		$(CHECK_FLAG) \
		--platform=$(PLATFORM) \
		--progress=$(PROGRESS) \
		--sbom=true \
		--provenance=true \
		-f $< \
		. \
		| tar -C $(TOOLS_IMAGE_DIR) -mx

.PHONY: load-image
load-image:
	tar -C $(IMAGE_DIR) -cf - . | docker load

.ONESHELL:

.PHONY: tools-image-digests
tools-image-digests: $(OUT_DIR)/tools-digests.txt
$(OUT_DIR)/tools-digests.txt: $(TOOLS_IMAGE_DIR)/index.json
	$(call get-digest,$<,$(IMAGE_DIR),$@)

define get-digests
	@INDEX_DIGEST=$$(jq -r '.manifests[0].digest' $(1)) && \
	MANIFEST_FILE=$$(echo "$$INDEX_DIGEST" | sed 's/sha256://' | xargs -I {} find $(2)/blobs/sha256 -name "{}" -type f) && \
	if [ -n "$$MANIFEST_FILE" ]; then \
		jq -r '.manifests[] | select(.annotations."vnd.docker.reference.type" != "attestation-manifest") | "\(.digest | sub("sha256:"; "")) \(.platform.os)/\(.platform.architecture)"' "$$MANIFEST_FILE" | sort > $(3); \
	else \
		echo "Error: Could not find manifest file for $$INDEX_DIGEST"; \
		exit 1; \
	fi
endef

.PHONY: shell
shell: $(OUT_DIR)/tools-digests.txt | $(OUT_DIR)
	$(MAKE) load-image IMAGE_DIR=$(TOOLS_IMAGE_DIR)
	$(call run-container,--rm,$(TOOLS_CONTAINER_REGISTRY)/$(TOOLS_CONTAINER_NAME):$(TOOLS_CONTAINER_VERSION),/bin/sh)

define run-container
	docker run -it \
		$(1) \
		--entrypoint $(3) \
		$(EXTRA_ARGS) \
		-v $$PWD:/home/user/gimli.js \
		$(2)
endef
