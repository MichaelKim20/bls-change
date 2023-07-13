#!/bin/sh

python3 ./staking_deposit/deposit.py \
--language=english \
--non_interactive \
generate-bls-to-execution-change \
--bls_to_execution_changes_folder=/app/data \
--chain="$1" \
--validator_start_index="$2" \
--validator_indices="$3" \
--bls_withdrawal_credentials_list="$4" \
--execution_address="$5" \
--mnemonic="$6"
