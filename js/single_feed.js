

// 세션에서 받아올 값
function getTokenFromSessionStorage() {
    return sessionStorage.getItem("jwtToken");
  }
  
  function getCurrentUserIdFromSessionStorage() {
    return sessionStorage.getItem("currentUserId");
  }
  
  function getCurrentFeedIdFromSessionStorage() {
    return sessionStorage.getItem("currentFeedId");
  }
  
  function getCurrentUserAccountTypeFromSessionStorage() {
    return sessionStorage.getItem("currentUserAccountType");
  }
  
  function getCurrentUserThumbnailFromSessionStorage() {
    return sessionStorage.getItem("thumbnail");
  }
  

// 쿼리 파라미터 가져오기
// http://127.0.0.1:5500/html/single_feed.html?feedId=1
let params = new URLSearchParams(window.location.search);
let feedId = params.get("feedId");

var CopyUrl = window.document.location.href;

var userAccountType = getCurrentUserAccountTypeFromSessionStorage();
var userThumbnail = getCurrentUserThumbnailFromSessionStorage();
var currentUserId = getCurrentUserIdFromSessionStorage();

$(document).ready(function (jwtToken) {
    var jwtToken = getTokenFromSessionStorage();
    console.log(jwtToken);
    $.ajax({
      url: `http://203.237.169.125:2002/feed/${feedId}`,
      type: "GET",
      dataType: "json",
      headers: {
        //Authorization: `Bearer ${jwtToken}`,
        },
      success: function (data) {
          console.log(feedId);
          console.log("sueccess: " + JSON.stringify(data));
          var currentFeedId = data.id;
                
          // 전체 아이템 박스
          var feedItem = $("<div>").prop({
              class: "feed_item",
          });
          var feedInfo = $("<div>").prop({
              class: "feed_info",
              id: "feedInfo" + data.id,
          });
          // feed 상단 부분 사용자 사진, 아이디
          var feedTopContainer = $("<div>").prop({
              class: "feedTop_container"
          });
          var feedTop =$("<div>").prop({
              class: "feed_top",
          })
          //유저 프로필 링크, 회원유형에 따라 구분
          var userProfileLink = "";
          if (userAccountType === "personal") {
              userProfileLink = "./profile_per.html";
          } else {
              userProfileLink = "./profile_ent.html";
          }

          // 사용자 프로필 정보 컨테이너
          var profileInfo = $("<a>")
          .addClass("profile_info")
          .on("click", function() {
              window.location.href=`${userProfileLink}?userId=${data.author.id}`;
          });
          var profileImg = $("<img>").attr({
              src: data.author.thumbnail,
              alt: data.author.id,
          });
          var userId = $("<div>").prop({
              class: "user_id",
              textContent: `${data.author.handle}`,
          });
          profileInfo.append(profileImg, userId);

          // 옵션 토글 버튼 (점 세 개)
          var optionContent = $("<div>").addClass("option_content").hide();
          var gotoUserInfo = $("<a>")
              .addClass("goTo_userInfo")
              .on("click", function(){
                  window.location.href=`${userProfileLink}?userId=${data.author.id}`;
              })
              .text("이 계정 정보");
          var saveBtnOption = $("<button>").addClass("save_btn").html("저장하기");
          optionContent.append(gotoUserInfo, saveBtnOption);

          var optionBtn = $("<button>").addClass("optionBtn").on("click", function() {
              optionContent.toggle();
          });
          var optionImg = $("<img>").attr({
              src: "../image/option_btn.png",
              alt: "optionButton",
          });
          optionBtn.append(optionImg);
      
          feedTop.append(profileInfo, optionBtn);
          feedTopContainer.append(feedTop, optionContent);

          // feed 이미지
          var imgUrls = data.image_urls;
          var imageContainer = $("<div>").addClass("image_container");
          var imageAlbum = $("<div>").addClass("image_album");
          var images = [];

          var btnContainer = $("<div>").addClass("btn_container");

          var prevBtn = $("<button>").addClass("previous");
          var prevImg = $("<img>").attr({
              src: "../image/new_feed2_leftarrow.png",
              alt: "prevButton",
          });
          prevBtn.append(prevImg);  

          var nextBtn = $("<button>").addClass("next");
          var nextImg = $("<img>").attr({
              src: "../image/new_feed2_rightarrow.png",
              alt: "nextButton",
          });
          nextBtn.append(nextImg);

          var currentSlideIndex = 0; // 현재 이미지 인덱스
          var sliding = false;

          // 이미지들 images 배열에 넣기
          $.each(imgUrls, function (imgIndex, imgUrl) {
              var feedImg = $("<img>").attr({
                  src: imgUrl,
                  alt: "Image " + (imgIndex + 1), 
                  class: "feed_image",
              });

              images.push(feedImg);
          });       
          // 첫 번째 이미지 추가
          imageAlbum.append(images[currentSlideIndex]);
          prevBtn.prop("disabled", true);
          prevBtn.on("click", goToPrev);
          nextBtn.on("click", goToNext);
          // 이미지 슬라이드 점들 추가
          var slideDots = $("<div>").addClass("slide_dots");
          var slideDotsList = [];
          for (var i = 0; i < imgUrls.length; i++) {
              var dot = $("<div>").addClass("dot").html(" ");
              slideDots.append(dot);
              slideDotsList.push(dot);
          }
          // 점들에 .dot 클래스 부여 후 슬라이드 점들 추가
          if (slideDotsList.length > 0) {
              slideDotsList[0].addClass("active_dot");
          };
          // 이미지 슬라이드 점 클릭 이벤트
          $(".dot").on("click", dotClick);
          btnContainer.append(prevBtn, nextBtn);
          imageContainer.append(imageAlbum, btnContainer, slideDots);

          // 기능 버튼 아이콘 (좋아요, 댓글, 공유, 저장)
          var feedFunctionContainer = $("<div>").addClass("feedFunction_container");
          var functionIconContainer = $("<div>").addClass("functionIcon_container");
          var functionIconItem = $("<div>").addClass("functionIcon_item");
      
          var heartImg = $("<img>").attr({
              id: "heart",
              src: "../image/heart.png",
              alt: "heart",
              width: "38rem",
              style: "padding-top: 0.1rem;",
          });
          var heartLink = $("<button type=button>")
          .addClass("heart_link")
          .on("click", function() {
            var currentSrc = heartImg.attr("src");
            var newSrc;

            if (heartLink.hasClass("filled_heart_link") && currentSrc === "../image/filled_heart.png" && data.is_liked == true) {
                newSrc = "../image/heart.png";
                heartLink.removeClass("filled_heart_link");
                heartLink.addClass("heart_link");
                data.is_liked = false;
                unlikedFeed(currentFeedId);
            } else {
                newSrc = "../image/filled_heart.png";
                heartLink.addClass("filled_heart_link");
                heartLink.removeClass("heart_link");
                data.is_liked = true;
                likedFeed(currentFeedId);
            }

            heartImg.attr("src", newSrc);
          });
          // 현재 src가 is_liked의 참/거짓 여부에 따라 바뀌게
          var currentSrc = data.is_liked ? "../image/filled_heart.png" : "../image/heart.png";
          heartImg.attr("src", currentSrc);

          // 현재 src에 따라 heartLink의 클래스 이름을 고치기
          if (currentSrc === "../image/filled_heart.png") {
              heartLink.removeClass("heart_link");
              heartLink.addClass("filled_heart_link");
          } else {
              heartLink.removeClass("filled_heart_link");
              heartLink.addClass("heart_link");
          }

          heartLink.prop({
              id: "heart_link" + data.id,
          });
          heartLink.append(heartImg);

          // 좋아요 수
          var likesContainer = $("<div>").addClass("likesNum_container");
          var likesNum = data.likes;
          likesContainer = likesNum + '명이 좋아합니다.'; 
          var likesNumContainer = $("<div>")
              .addClass("likesNum_container")
              .text(likesContainer);

          // 댓글 버튼
          var commentLink = $("<button type=button id=comment_btn>")
          .addClass("comment_link")
          .on("click", function () {
              openModal(currentFeedId, currentUserId, userProfileLink); 
          });
          var commentImg = $("<img>").attr({
              src: "../image/comment.png",
              alt: "comment",
              width: "31rem",
              style: "margin-left: 0.3rem; padding-top: 0.1rem;",
          });
          
          commentLink.append(commentImg);
      
          // 공유 버튼
          var shareLink = $("<button type=button>")
          .addClass("share_link")
          .on("click", function() {
            copyLink(CopyUrl);
          });
          var shareImg = $("<img>").attr({
              src: "../image/share.png",
              alt: "shareBtn",
              width: "40rem",
              style: "margin-left: 0.4rem; padding-top: 0.2rem;",
          });
          
          shareLink.append(shareImg);
          functionIconItem.append(heartLink, commentLink, shareLink);
          
          // 저장 버튼
          var saveImg = $("<img>").attr({
              src: "../image/save.png",
              alt: "saveBtn",
              width: "32rem",
          });
          var saveLink = $("<button type=button>")
          .addClass("save_link")
          .on("click", function () {
            var currentSaveSrc = saveImg.attr("src");
            var newSaveSrc;

            if (saveLink.hasClass("filled_save_link") && currentSaveSrc === "../image/filled_save.png" && data.is_saved == true) {
                newSaveSrc = "../image/save.png";
                saveLink.removeClass("filled_save_link");
                saveLink.addClass("save_link");
                data.is_saved = false;
                unsavedFeed(currentUserId, currentFeedId);
            } else {
                newSaveSrc = "../image/filled_save.png";
                saveLink.addClass("filled_save_link");
                saveLink.removeClass("save_link");
                data.is_saved = true;
                savedFeed(currentUserId, currentFeedId);
            }

            saveImg.attr("src", newSaveSrc);
          });
          saveLink.prop({
              id: "save_link" + data.id,
          });
          var currentSaveSrc = data.is_saved ? "../image/filled_save.png" : "../image/save.png";
          saveImg.attr("src", currentSaveSrc);

          if (currentSaveSrc === "../image/filled_save.png") {
              saveLink.removeClass("save_link");
              saveLink.addClass("filled_save_link");
          } else {
              saveLink.removeClass("filled_save_link");
              saveLink.addClass("save_link");
          }

          saveLink.append(saveImg);
          functionIconContainer.append(functionIconItem, saveLink);
          
          // 기능목록 flex 합치기
          feedFunctionContainer.append(functionIconContainer, likesNumContainer);
      
          // feed 하단부분 전체 (아이디, 해쉬태그, 내용)
            // IdHashtag div (아이디, 해쉬태그)
            var IdHashtag = $("<div>").prop({
                class: "IdHashtag",
            });
            var bottomUserId = $("<a>").prop({
                class: "bottom_id",
                textContent: data.author.handle,
            })
            .on("click", function () {
                window.location.href = `${userProfileLink}?userId=${data.author.id}`
            })
            var feedHashtag = $("<a>")
            .prop({
                class: "feed_hashtag",
                textContent: `${data.tagged_user && data.tagged_user.name !== null ? data.tagged_user.name : "태그된 기업"}`,
            })
            .on("click", function() {
                if (data.tagged_user && data.tagged_user.id) {
                    window.location.href = `./profile_ent.html?userId=${data.tagged_user.id}`;
                }
            });

          IdHashtag.append(bottomUserId, feedHashtag);

          var feedScript = $("<div>").prop({
              class: "feed_script",
              textContent: data.content,
          });

          // 업로드 날짜 (현재로부터 얼마 전인지)
          var uploaded_date = $("<div>").addClass("uploaded_date");

          var uploadDate = new Date(data.created_at); 
          var currentDate = new Date();
          var timeDiffInMilliseconds = currentDate - uploadDate;

          var timeDiffInMinutes = Math.floor(timeDiffInMilliseconds / (1000 * 60));
          var timeDiffInHours = Math.floor(timeDiffInMinutes / 60);
          var timeDiffInDays = Math.floor(timeDiffInHours / 24);

          var uploadDateString;

          if (timeDiffInDays > 0) {
              uploadDateString = timeDiffInDays + '일 전';
          } else if (timeDiffInHours > 0) {
              uploadDateString = timeDiffInHours + '시간 전';
          } else if (timeDiffInMinutes > 0) {
              uploadDateString = timeDiffInMinutes + '분 전';
          } else {
              uploadDateString = '방금 전';
          }

          var uploadedDate = $("<div>")
              .addClass("uploaded_date")
              .text(uploadDateString);

          uploaded_date.append(uploadedDate);
      
          feedInfo.append(IdHashtag,feedScript ,uploaded_date);
          
          feedItem.append(feedTopContainer, imageContainer, feedFunctionContainer, feedInfo);
          $(".feed_list").append(feedItem);
          

          // 함수들
          // 이미지 슬라이드
          function goToPrev() {
              if (!sliding) {
                  sliding = true;
                  currentSlideIndex = (currentSlideIndex - 1 + images.length) % images.length;
                  updateSlide();
              } 
          }
  
          function goToNext() {
              if (!sliding) {
                  sliding = true;
                  currentSlideIndex = (currentSlideIndex + 1) % images.length;
                  updateSlide();
              }
          }
          // 점 클릭
          function dotClick() {
              if (!sliding) {
                  var index = $(this).index();
                  if (index !== currentSlideIndex) {
                  sliding = true;
                  currentSlideIndex = index;
                  updateSlide();
                  }
              }
          }
          // 이미지 슬라이드 업뎃
          function updateSlide() {
              imageAlbum.empty(); 
              imageAlbum.append(images[currentSlideIndex]);
              
              slideDotsList.forEach(function(dot, index) {
                  if (index === currentSlideIndex){
                  dot.addClass("active_dot");
                  } else {
                  dot.removeClass("active_dot");
                  }
              });
          
              sliding = false;
      
              // prevBtn과 nextBtn 처음과 끝일 때 버튼 사용 X
              if (currentSlideIndex === 0) {
              prevBtn.prop("disabled", true);
              } else {
              prevBtn.prop("disabled", false);
              }
      
              if (currentSlideIndex === images.length - 1) {
              nextBtn.prop("disabled", true);
              } else {
              nextBtn.prop("disabled", false);
              }
          }

            
          
      },
      error: function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 400) {
              console.error('Bad Request:', jqXHR.responseText);
              alert("잘못된 주소입니다.");
          } else if (jqXHR.status === 404) {
              console.error('Not Found:', jqXHR.responseText);
              alert("피드가 존재하지 않습니다.");
              window.history.back();
          } else {
              console.error('Error:', jqXHR.status, errorThrown);
          }
      }
  });
});

// 모달창 닫기 버튼 클릭 시 모달창을 닫도록 이벤트를 추가합니다.
$(".close_modal").on("click", function () {
  $(".modal").css("display", "none");

  $(".feeds_container").empty();
  $(".comments_container").empty();
  $(".postComment").empty();
  $("#comment_input").val(null);
});
