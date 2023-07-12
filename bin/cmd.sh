#!/bin/sh

system=""
case "$OSTYPE" in
darwin*) system="darwin" ;;
linux*) system="linux" ;;
msys*) system="windows" ;;
cygwin*) system="windows" ;;
*) system="linux" ;;
esac
readonly system
echo $system

arch=""
case $(uname -m) in
    i386)    arch="amd64" ;;
    i686)    arch="amd64" ;;
    x86_64)  arch="amd64" ;;
    arm)     arch="arm64" ;;
    arm64)   arch="arm64" ;;
esac
readonly arch
echo $arch

deposit_cli=""
if [ "$system" = "windows" ]; then
  deposit_cli=".\bin\windows\deposit.exe"
else
  deposit_cli="./bin/$system-$arch/deposit"
fi

$deposit_cli \
--language=english \
--non_interactive \
generate-bls-to-execution-change \
--bls_to_execution_changes_folder=$(pwd)\data \
--chain="$1" \
--validator_start_index="$2" \
--validator_indices="$3" \
--bls_withdrawal_credentials_list="$4" \
--execution_address="$5" \
--mnemonic="$6"
