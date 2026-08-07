# Build the membership Type Script for CKB-VM (RISC-V).
# Requires: rustup target add riscv64imac-unknown-none-elf

TARGET := riscv64imac-unknown-none-elf
MODE ?= release
CARGO_FLAGS := --target $(TARGET)
ifeq ($(MODE),release)
	CARGO_FLAGS += --release
endif

.PHONY: build test clean check-target

check-target:
	@rustup target list --installed | grep -q '$(TARGET)' || \
		(echo "Missing target $(TARGET). Run: rustup target add $(TARGET)" && exit 1)

# Uses clang as CC so blake2b-ref / ckb-std native bits do not need riscv64-*-gcc.
# Still prefer pure-Rust hashing in membership (blake2b-ref).
build: check-target
	CC_riscv64imac_unknown_none_elf=clang \
	CFLAGS_riscv64imac_unknown_none_elf="--target=riscv64-unknown-none-elf -march=rv64imac_zba_zbb_zbc_zbs -mabi=lp64" \
	cargo build -p membership $(CARGO_FLAGS)
	@mkdir -p build/$(MODE)
	@cp $${CARGO_TARGET_DIR:-target}/$(TARGET)/$(MODE)/membership build/$(MODE)/membership 2>/dev/null || \
		cp target/$(TARGET)/$(MODE)/membership build/$(MODE)/membership
	@echo "Built: build/$(MODE)/membership"

# Host-side unit tests (JSON helpers) + placeholder for ckb-testtool later
test:
	cargo test -p membership --lib
	cargo test -p membership-tests

clean:
	cargo clean
	rm -rf build
