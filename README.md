# BLS to Execution Change Data 자동생성하기

## 도커이미지 생성하기

```shell
./docker-build.sh
```

## 실행하기

아래 과정을 단계별로 순서데로 진행해야 합니다.

### 과정 1. 검증자의 정보를 찾기

먼저 검증자의 키를 `./validator_keys/` 로 복사합니다.  
그리고 아래 명령어를 실행합니다. 

```shell
docker run -it -v $(pwd):/app/data --rm mukeunkim/bls-change
```

`명령어 1` 을 선택합니다.  
`네트워크`와 `인출주소`를 입력하면 검증자의 정보를 노드에서 찾아서 `./validator_info.json` 에 저장합니다.  

이제 다음 과정으로 넘어가세요.

### 과정 2. 인출주소 등록 데이터 생성하기

이 작업을 진행하기 위해서는 위의 `과정 1` 을 먼저 진행해야 합니다. 
왜냐하면 이 `과정 2` 에서는 `과정 1` 에서 만든 ./validator_info.json` 이 필요하기 때문입니다.

그리고 아래 명령어를 실행합니다.  

```shell
docker run -it -v $(pwd):/app/data --rm mukeunkim/bls-change
```

`명령어 2` 을 선택합니다.   
`인출주소 등록 데이타` 가 `./bls_to_execution_changes/` 에 저장되어 있습니다.  
이 폴더를 [`agora-chain`](https://github.com/bosagora/agora-chain.git) 에 복사한 후 일괄 등록하면 됩니다.  
