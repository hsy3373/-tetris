const blocks = ["one", "two", "three"];

// DOM
const start = document.querySelector(".tetris_board>ul");
const gameEnd = document.querySelector(".gameEnd");
const gameStart = document.querySelector(".gameStart");
const StartBtn = document.querySelector(".startBtn");
const reStartBtn = document.querySelector(".restartBtn");
const scoreDisplay = document.querySelector(".score");

//Start Setting
const tetris_cols = 8; // 가로 개수
const tetris_rows = 10; // 세로 개수

//variables
let score = 0;
let speed = 500;
let downInterval;
let temp_block1;
let temp_block2;

//현재 살아있는 블록들 상태 업데이트용도
let aliveBlocks;

let checking = false;

let move_item1 = {
  type: "a", //블록 타입
  location_top: 0, //블록의 위치 x값 0~9
  location_left: 3, //블록의 위치 y값 0~19
};

let move_item2 = {
  type: "a", //블록 타입
  location_top: 0, //블록의 위치 x값 0~9
  location_left: 4, //블록의 위치 y값 0~19
};

//functions
function init() {
  // 0, 1, 2번째 요소를 제외한 나머지 요소 삭제
  blocks.splice(3);

  score = 0;

  scoreDisplay.innerText = score;

  //가장 최초의 무브 아이템 내용으로 temp_block 채워줌
  temp_block1 = { ...move_item1 };
  temp_block2 = { ...move_item2 };

  // 설정한 행 개수만큼 열 만드는 함수 돌림
  for (let i = 0; i < tetris_rows; i++) {
    prependNewLine();
  }
  generateNewBlock();
}

// 기본적으로 테트리스 블록 화면의 각 열 구현하는 메서드
function prependNewLine() {
  const trans_li = document.createElement("li");
  const bar_ul = document.createElement("ul");

  for (let j = 0; j < tetris_cols; j++) {
    const tetris_block = document.createElement("li");
    bar_ul.prepend(tetris_block);
  }

  trans_li.prepend(bar_ul);
  start.prepend(trans_li);
}

// 하강할때 부를 렌더링 함수
function goDownBlock() {
  const {
    type: type_1,
    location_top: top_1,
    location_left: left_1,
  } = temp_block1;
  const {
    type: type_2,
    location_top: top_2,
    location_left: left_2,
  } = temp_block2;

  //이동 효과를 주기 위해 이동 전 블록의 클랙스를 지움
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moveing) => {
    moveing.classList.remove(type_1, type_2, "moving");
  });

  const target1 = start.childNodes[top_1]
    ? start.childNodes[top_1].childNodes[0].childNodes[left_1]
    : null;

  const target2 = start.childNodes[top_2]
    ? start.childNodes[top_2].childNodes[0].childNodes[left_2]
    : null;

  if (aliveBlocks === "all") {
    // 두개 다 살았을 경우

    let check1 = checkEmp(target1);
    let check2 = checkEmp(target2);

    if (!check1 && !check2) {
      //만약 둘다 상태가 안좋으면 기존 위치에서 seized 처리
      temp_block1 = { ...move_item1 };
      temp_block2 = { ...move_item2 };

      seizeBlock("all");
    } else if (check1 && check2) {
      //둘다 상태 좋을때
      target1.classList.add(type_1, "moving");
      target2.classList.add(type_2, "moving");
    } else if (check1 && !check2) {
      // 1번만 살아남았을때
      aliveBlocks = 1;

      //1번은 아래로 내려서 무빙 계속 이어가도록처리
      target1.classList.add(type_1, "moving");

      // 2번은 기존 위치로 돌리고 seized 처리
      temp_block2 = { ...move_item2 };
      seizeBlock(2);
    } else if (!check1 && check2) {
      // 2번만 살아남았을때
      aliveBlocks = 2;

      //2번은 아래로 내려서 무빙 계속 이어가도록처리
      target2.classList.add(type_2, "moving");

      // 1번은 기존 위치로 돌리고 seized 처리
      temp_block1 = { ...move_item1 };
      seizeBlock(1);
    }
  } else if (aliveBlocks === 1) {
    //만약 1번만 살아있을 경우

    if (checkEmp(target1)) {
      target1.classList.add(type_1, "moving");
    } else {
      // 기존 위치로 돌리고 seized 처리
      temp_block1 = { ...move_item1 };
      seizeBlock(1);
    }
  } else if (aliveBlocks === 2) {
    if (checkEmp(target2)) {
      target2.classList.add(type_2, "moving");
    } else {
      // 기존 위치로 돌리고 seized 처리
      temp_block2 = { ...move_item2 };
      seizeBlock(2);
    }
  }

  move_item1.location_left = left_1;
  move_item1.location_top = top_1;

  move_item2.location_left = left_2;
  move_item2.location_top = top_2;
}

function goLeftBlock(moveType = "") {
  const {
    type: type_1,
    location_top: top_1,
    location_left: left_1,
  } = temp_block1;
  const {
    type: type_2,
    location_top: top_2,
    location_left: left_2,
  } = temp_block2;

  const target1 = start.childNodes[top_1]
    ? start.childNodes[top_1].childNodes[0].childNodes[left_1]
    : null;

  const target2 = start.childNodes[top_2]
    ? start.childNodes[top_2].childNodes[0].childNodes[left_2]
    : null;

  //이동 효과를 주기 위해 이동 전 블록의 클랙스를 지움
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moveing) => {
    moveing.classList.remove(type_1, type_2, "moving");
  });

  if (aliveBlocks === "all") {
    // 둘다 살았을 경우

    if (checkEmp(target1) && checkEmp(target2)) {
      //둘다 상태가 정상이어야만 무빙 적용
      target1.classList.add(type_1, "moving");
      target2.classList.add(type_2, "moving");
    } else {
      //만약 둘다 상태가 안좋으면 기존 위치로 돌리고 한번더 실행
      temp_block1 = { ...move_item1 };
      temp_block2 = { ...move_item2 };

      if (moveType === "retry") {
        generateNewBlock();
      } else {
        setTimeout(() => {
          goLeftBlock("retry");
        }, 0);
      }

      return;
    }
  } else if (aliveBlocks === 1) {
    //1번만 살았을 경우
    if (checkEmp(target1)) {
      target1.classList.add(type_1, "moving");
    } else {
      temp_block1 = { ...move_item1 };
      setTimeout(() => {
        goLeftBlock("retry2");
      }, 0);
      return;
    }
  } else if (aliveBlocks === 2) {
    // 2번만 살았을 경우
    if (checkEmp(target2)) {
      target2.classList.add(type_2, "moving");
    } else {
      temp_block2 = { ...move_item2 };
      setTimeout(() => {
        goLeftBlock("retry3");
      }, 0);
      return;
    }
  }

  move_item1.location_left = left_1;
  move_item1.location_top = top_1;

  move_item2.location_left = left_2;
  move_item2.location_top = top_2;
}

function checkEmp(target) {
  //타겟이 없거나, 타겟의 클래스중에 seized가 있다면 false
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}

function moveBlock(moveType, val) {
  temp_block1[moveType] += val;
  temp_block2[moveType] += val;

  if (moveType === "location_top") {
    goDownBlock();
  } else if (moveType === "location_left") {
    goLeftBlock();
  }
}

//나중에 전체 무빙을 없애는게 아니라 현재 칸만 무빙 없애는걸로 바꿔야함
// 매개변수로 현재 요소받아서 거기만 무빙 빼고 추가하는 뭔가가 필요할듯
function seizeBlock(block) {
  if (block === "all") {
    const target1 =
      start.childNodes[move_item1.location_top].childNodes[0].childNodes[
        move_item1.location_left
      ];
    const target2 =
      start.childNodes[move_item2.location_top].childNodes[0].childNodes[
        move_item2.location_left
      ];

    target1.classList.remove("moving");
    target1.classList.add(move_item1.type, "seized");
    target2.classList.remove("moving");
    target2.classList.add(move_item2.type, "seized");
  } else if (block === 1) {
    const target = start.childNodes[move_item1.location_top]
      ? start.childNodes[move_item1.location_top].childNodes[0].childNodes[
          move_item1.location_left
        ]
      : null;
    target.classList.remove("moving");
    target.classList.add(move_item1.type, "seized");
  } else if (block === 2) {
    const target = start.childNodes[move_item2.location_top]
      ? start.childNodes[move_item2.location_top].childNodes[0].childNodes[
          move_item2.location_left
        ]
      : null;
    target.classList.remove("moving");
    target.classList.add(move_item2.type, "seized");
  }

  // 현제 체킹중인지 아닌지에 따라서 check_match 실행여부 결정\
  // checking = true;면 현재 check_match가 돌아가고 있다는 뜻

  if (!checking) {
    checking = true;
    //블럭들 합치기 체크 상황에 따라 반복시켜야 해서 while에 넣음
    while (check_match()) {}
  }

  if (document.querySelectorAll(".moving").length <= 0) {
    //만약 현재 무빙중인 것이 하나도 없다면
    generateNewBlock();
  }
}

//좌우 블럭 값 서로 바꾸기용
function changeBlock() {
  const {
    type: type_1,
    location_top: top_1,
    location_left: left_1,
  } = temp_block1;
  const {
    type: type_2,
    location_top: top_2,
    location_left: left_2,
  } = temp_block2;

  const target1 = start.childNodes[top_1]
    ? start.childNodes[top_1].childNodes[0].childNodes[left_1]
    : null;

  const target2 = start.childNodes[top_2]
    ? start.childNodes[top_2].childNodes[0].childNodes[left_2]
    : null;

  //이동 효과를 주기 위해 이동 전 블록의 클랙스를 지움
  const movingBlocks = document.querySelectorAll(".moving");
  movingBlocks.forEach((moveing) => {
    moveing.classList.remove(type_1, type_2, "moving");
  });

  if (target1 && target2) {
    target1.classList.add(type_2, "moving");
    target2.classList.add(type_1, "moving");

    move_item1.location_left = left_2;
    move_item1.location_top = top_2;

    move_item2.location_left = left_1;
    move_item2.location_top = top_1;

    temp_block1.location_left = left_2;
    temp_block1.location_top = top_2;

    temp_block2.location_left = left_1;
    temp_block2.location_top = top_1;
  }
}

function sleep(ms) {
  const wakeUpTime = Date.now() + ms;
  while (Date.now() < wakeUpTime) {}
}

function check_match() {
  //각 행들담은 변수
  const childes = start.childNodes;

  let line = 0;

  //각행별로 다 차있는지를 검사하는데 나는 앞뒤좌우 검사해야함
  for (let i = 0; i < childes.length; i++) {
    let matched = true;
    // 모든 라인을 돌며
    // 각 라인의 첫번째부터 끝번까지 검사
    for (
      let j = 0;
      j < childes[i].querySelectorAll("li > ul > li").length;
      j++
    ) {
      //현재 위치 = i 행의 j 번째 요소
      let el = childes[i].querySelectorAll("li > ul > li")[j];

      if (el.classList.value.indexOf("ten") > 0) {
        //만약 최종단계라면 건너뛰기
        continue;
      }

      //만약 현재요소의 클래스에 seized가 있으면
      if (el.classList.value.indexOf("seized") > 0) {
        let nowClassList = el.classList;
        let list = [];
        let els = {
          //  상, 좌, 우, 하 순으로 객체 담음
          0: childes[i - 1]
            ? childes[i - 1].querySelectorAll("li > ul > li")[j]
            : null,
          1: childes[i + 1]
            ? childes[i + 1].querySelectorAll("li > ul > li")[j]
            : null,
          2: childes[i].querySelectorAll("li > ul > li")[j - 1],
          3: childes[i].querySelectorAll("li > ul > li")[j + 1],
        };

        // 만약 현재기준 바닥이 존재하는데 클래스명이 없을때
        if (els[1] && els[1].classList.length <= 0) {
          els[1].classList = el.classList;
          el.classList = "";
          // 바닥으로 내려준 후 검사 다시 시작
          return true;
        }

        for (let n = 0; n < 4; n++) {
          if (els[n] && els[n].classList.value == nowClassList.value) {
            list.push(els[n]);
          }
          if (list.length >= 2) {
            break;
          }
        }

        if (list.length >= 2) {
          for (let li of list) {
            li.classList = "";
          }

          let next = nextClassLevel(nowClassList[0]);

          el.classList = next + " seized";

          if (!blocks.includes(next)) {
            blocks.push(next);
          }

          score++;
          scoreDisplay.innerText = score;

          return true;
        }

        line++;
      } else {
        line = 0;
        matched = false;
      }
    }

    //만약 그냥 꽉찬 행을 두번 만나게 되면 더이상 검사하는것을 멈추고 for문을 빠져나가도록 처리
    if (matched && line >= tetris_cols * 2) {
      break;
    }
  }
  checking = false;
  return false;
}

function nextClassLevel(className) {
  className = className.trim();

  let newClass = "";
  switch (className) {
    case "one":
      newClass = "two";
      break;
    case "two":
      newClass = "three";
      break;
    case "three":
      newClass = "four";
      break;
    case "four":
      newClass = "five";
      break;
    case "five":
      newClass = "six";
      break;
    case "six":
      newClass = "seven";
      break;
    case "seven":
      newClass = "eight";
      break;
    case "eight":
      newClass = "nine";
      break;
    case "nine":
      newClass = "ten";
      break;
  }

  return newClass;
}

function showGameOverText() {
  gameEnd.style.display = "block";

  document.querySelector(".end-score").innerText = score + "코인 적립";
}

// 새로운 블럭 만드는 메서드
function generateNewBlock() {
  const target1 = start.childNodes[1].childNodes[0].childNodes[3];
  const target2 = start.childNodes[1].childNodes[0].childNodes[4];

  if (target1.classList.length >= 1 || target2.classList.length >= 1) {
    //만약 새로운 블럭 만들려고 하는데 맨 윗칸 둘중 하나라도 차있으면 게임오버처리

    showGameOverText();
    clearInterval(downInterval);

    return;
  }

  aliveBlocks = "all";

  // 기존의 아래로 내려가던 반복 동작 삭제
  clearInterval(downInterval);

  //새로 아래로 내려가는 동작 시작
  downInterval = setInterval(() => {
    moveBlock("location_top", 1);
  }, speed);

  let randomIndex1 = Math.floor(Math.random() * (blocks.length - 1));
  let randomIndex2 = Math.floor(Math.random() * (blocks.length - 1));
  //랜덤으로 블럭 타입 세팅 + 아이템의 위치값 재설정
  move_item1.type = blocks[randomIndex1];
  move_item1.location_top = 0;
  move_item1.location_left = 3;
  temp_block1 = { ...move_item1 };

  //랜덤으로 블럭 타입 세팅 + 아이템의 위치값 재설정
  move_item2.type = blocks[randomIndex2];
  move_item2.location_top = 0;
  move_item2.location_left = 4;
  temp_block2 = { ...move_item2 };

  // 랜더링 시작
  goDownBlock();
}

//키보드 아래방향키 입력되었을때 동작
function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("location_top", 1);
  }, 10);
}

//event handling
document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 37: {
      moveBlock("location_left", -1);
      break;
    }
    case 39: {
      moveBlock("location_left", 1);
      break;
    }
    case 38: {
      if (aliveBlocks === "all") {
        changeBlock();
      }
      break;
    }
    case 40: {
      moveBlock("location_top", 1);
      break;
    }
    case 32: {
      dropBlock();
    }
    default:
      break;
  }
});

StartBtn.addEventListener("click", () => {
  gameStart.style.display = "none";

  init();
});

reStartBtn.addEventListener("click", () => {
  start.innerHTML = ""; // 게임판 초기화
  init(); //새로운 게임 시작
  gameEnd.style.display = "none"; //종료창 제거
});
