import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchNews } from "../../redux/home/newsSlice";
import { fetchTrending } from "../../redux/home/trendingSlice";
import { fetchCategoryArticles } from "../../redux/category/categorySlice";
import { setKeyword } from "../..//redux/search/searchSlice";
import { ClipLoader } from "react-spinners";
import "./HomeScreen.css";
import NewsTicker from "./NewsTicker";
import ThemeToggle from "../../components/themetoggle/ThemeToggle";
import ScrollToTop from "../../components/scrolltop/ScrollToTop";
import TrendingWordCloud from "../../components/wordcloud/TrendingWordCloud";

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/600x400";

const CATEGORY_MAP = {
  "the-gioi": "Thế giới",
  "thoi-su": "Thời sự",
  "kinh-te": "Kinh tế",
  "giai-tri": "Giải trí",
  "the-thao": "Thể thao",
  "phap-luat-chinh-tri": "Pháp luật - Chính trị",
  "giao-duc": "Giáo dục",
  "suc-khoe-doi-song": "Sức khỏe - Đời sống",
  "du-lich": "Du lịch",
  "khoa-hoc-cong-nghe": "Khoa học - Công nghệ",
  xe: "Xe",
  "van-hoa": "Văn hóa",
  "doi-song": "Đời sống",
};

const ErrorMessage = ({ error, onRetry }) => (
  <div className="error">
    <p>{error}</p>
    <button onClick={onRetry}>Retry</button>
  </div>
);

const LoadingSpinner = () => (
  <div className="loading">
    <ClipLoader color="#3498db" size={50} />
  </div>
);

const handleImageError = (e, url) => {
  e.target.src = FALLBACK_IMAGE_URL;
};

const getLogoUrl = (rssUrl) => {
  try {
    const parsedUrl = new URL(rssUrl);
    const hostname = parsedUrl.hostname;

    if (hostname.includes("vnexpress")) {
      return "https://s1.vnecdn.net/vnexpress/restruct/i/v9505/v2_2019/pc/graphics/logo.svg";
    } else if (hostname.includes("thanhnien")) {
      return "https://static.thanhnien.com.vn/thanhnien.vn/image/logo.svg";
    } else if (hostname.includes("nhandan")) {
      return "https://upload.wikimedia.org/wikipedia/vi/d/d7/Logo-NhanDan.png?20221117215128";
    } else if (hostname.includes("dantri")) {
      return "https://icdn.dantri.com.vn/2022/12/14/3-1671004462503.png";
    } else if (hostname.includes("tuoitre")) {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Tu%E1%BB%95i_Tr%E1%BA%BB_Logo.svg/2560px-Tu%E1%BB%95i_Tr%E1%BA%BB_Logo.svg.png";
    } else {
      return "https://via.placeholder.com/100x50?text=Logo";
    }
  } catch (error) {
    console.error("Invalid URL:", rssUrl, error);
    return "https://via.placeholder.com/100x50?text=Logo";
  }
};

const getTimeDifference = (pubDate) => {
  const currentTime = new Date();
  const publishedTime = new Date(pubDate);
  const timeDifferenceInMs = currentTime - publishedTime;

  const minutesDifference = Math.floor(timeDifferenceInMs / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);

  if (daysDifference >= 1) return `${daysDifference} days ago`;
  if (hoursDifference >= 1) return `${hoursDifference} hours ago`;
  return `${minutesDifference} minutes ago`;
};

export const MainNewsCard = ({ article }) => (
  <div className="main-news">
    <a href={article.link} target="_blank" rel="noreferrer">
      <img
        src={article.img}
        alt="Main News"
        onError={(e) => handleImageError(e, article.img)}
        className="main-news-image"
      />
      <h2>{article.title}</h2>
      <div className="main-news-info">
        <img
          src={getLogoUrl(article.url)}
          alt="Logo"
          className="main-news-logo"
        />
        <span>{getTimeDifference(article.pubDate)}</span>
      </div>
    </a>
  </div>
);

export const TopKeywordSection = ({ keywords }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleKeywordClick = async (keyword) => {
    dispatch(setKeyword(keyword)); // Cập nhật từ khóa trong Redux

    try {
      // Gọi API tìm kiếm ngay lập tức
      const response = await fetch(
        `http://localhost:2048/api/search?q=${keyword}`
      );
      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi tìm kiếm");
      }
      const data = await response.json();

      // Chuyển hướng sang trang tìm kiếm với kết quả
      navigate("/search", { state: { searchResults: data, q: keyword } });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
    }
  };

  return (
    <div className="keyword-section">
      <div id="top-keywords" className="top-keywords-container">
        <h3 className="keywords-title">🔥 Top Từ Khóa</h3>
        <ul className="keywords-list">
          {keywords.map((item, index) => (
            <li
              key={index}
              className="keyword-item"
              onClick={() => handleKeywordClick(item.keyword)}
            >
              <span className="keyword-rank">{index + 1}.</span> {item.keyword}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const SecondaryNewsSection = ({ articles }) => (
  <div className="secondary-news">
    {articles.map((article, index) => (
      <div key={index} className="secondary-news-card">
        <a href={article.link} target="_blank" rel="noreferrer">
          <img
            src={article.img}
            alt="Secondary News"
            onError={(e) => handleImageError(e, article.img)}
            className="secondary-news-image"
          />
          <h3>{article.title}</h3>
          <div className="secondary-news-info">
            <img
              src={getLogoUrl(article.url)}
              alt="Logo"
              className="secondary-news-logo"
            />
            <span>{getTimeDifference(article.pubDate)}</span>
          </div>
        </a>
      </div>
    ))}
  </div>
);

export const AdditionalNews = ({ articles }) => (
  <div className="additional-news-right">
    {articles.map((article, index) => (
      <a
        key={index}
        href={article.link}
        target="_blank"
        rel="noreferrer"
        className="additional-news-card-right"
      >
        <img
          src={article.img}
          alt="Additional News"
          onError={(e) => handleImageError(e, article.img)}
          className="additional-news-image-right"
        />
        <div className="additional-news-info-right">
          <h4>{article.title}</h4>
          <div className="additional-news-info-row-right">
            <img
              src={getLogoUrl(article.url)}
              alt="Logo"
              className="additional-news-logo-1-right"
            />
            <span>{getTimeDifference(article.pubDate)}</span>
          </div>
        </div>
      </a>
    ))}
  </div>
);

export const AdditionalNews2 = ({ articles }) => (
  <div className="additional-news-second-part">
    {articles.map((article, index) => (
      <a
        key={index}
        href={article.link}
        target="_blank"
        rel="noreferrer"
        className="additional-news-second-part-card"
      >
        <img
          src={article.img}
          alt="Additional News"
          onError={(e) => handleImageError(e, article.img)}
          className="additional-news-second-part-card-img"
        />
        <div className="additional-news-info">
          <h4>{article.title}</h4>
          <div className="additional-news-info-row">
            <img
              src={getLogoUrl(article.url)}
              alt="Logo"
              className="additional-news-logo-2"
            />
            <span>{getTimeDifference(article.pubDate)}</span>
          </div>
        </div>
      </a>
    ))}
  </div>
);

export const CategoryAdditionalNews = ({ articles, category }) => {
  const navigate = useNavigate();

  return (
    <div className="additional-news-second-part">
      <h2>{CATEGORY_MAP[category] || category}</h2>
      {articles.map((article, index) => (
        <a
          key={index}
          href={article.link}
          target="_blank"
          rel="noreferrer"
          className="additional-news-second-part-card"
        >
          <img
            src={article.img}
            alt="Additional News"
            onError={(e) => handleImageError(e, article.img)}
            className="additional-news-second-part-card-img"
          />
          <div className="additional-news-info">
            <h4>{article.title}</h4>
            <div className="additional-news-info-row">
              <img
                src={getLogoUrl(article.url)}
                alt="Logo"
                className="additional-news-logo-2"
              />
              <span>{getTimeDifference(article.pubDate)}</span>
            </div>
          </div>
        </a>
      ))}
      {/* Nút xem thêm */}
      <div className="btn-xemtatca">
        <button
          className="view-more-button"
          onClick={() => navigate(`/category/${category}`)}
        >
          Xem tất cả
        </button>
      </div>
    </div>
  );
};

const partners = [
  {
    name: "Thanh Niên",
    logoUrl: "https://static.thanhnien.com.vn/thanhnien.vn/image/logo.svg",
    link: "https://thanhnien.vn/",
  },
  {
    name: "Nhân Dân",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/vi/d/d7/Logo-NhanDan.png?20221117215128",
    link: "https://nhandan.vn/",
  },
  {
    name: "VnExpress",
    logoUrl:
      "https://s1.vnecdn.net/vnexpress/restruct/i/v9505/v2_2019/pc/graphics/logo.svg",
    link: "https://vnexpress.net/",
  },
  {
    name: "Dân Trí",
    logoUrl: "https://icdn.dantri.com.vn/2022/12/14/3-1671004462503.png",
    link: "https://dantri.com.vn/",
  },
];

export const PartnersSection = () => {
  return (
    <div className="partners-section">
      <h3>Tổng hợp các báo</h3>
      <div className="partners-container">
        <div className="marquee">
          {partners.map((partner, index) => (
            <a
              key={index}
              href={partner.link}
              target="_blank"
              rel="noreferrer"
              className="partner-card"
            >
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="partner-logo"
              />
              <span className="partner-name">{partner.name}</span>
            </a>
          ))}
          {/* Lặp lại các phần tử để tạo hiệu ứng cuộn liên tục */}
          {partners.map((partner, index) => (
            <a
              key={`repeat-${index}`}
              href={partner.link}
              target="_blank"
              rel="noreferrer"
              className="partner-card"
            >
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="partner-logo"
              />
              <span className="partner-name">{partner.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
const HomeScreen = () => {
  const categories = [
    "the-gioi",
    "thoi-su",
    "kinh-te",
    "giai-tri",
    "the-thao",
    "phap-luat-chinh-tri",
    "giao-duc",
    "suc-khoe-doi-song",
    "du-lich",
    "khoa-hoc-cong-nghe",
    "xe",
    "van-hoa",
    "doi-song",
  ];
  const [categoryArticles, setCategoryArticles] = useState({});
  const dispatch = useDispatch();

  // Sử dụng useSelector để lấy trạng thái từ Redux
  const { articles, loading, error } = useSelector((state) => state.news);

  const {
    keywords,
    loading: trendingLoading,
    error: trendingError,
  } = useSelector((state) => state.trending);
  const [visibleOverflowCount, setVisibleOverflowCount] = useState(50);

  useEffect(() => {
    // Disable scroll restoration to force scroll to top
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // Scroll to top on component mount or refresh
    window.scrollTo(0, 0);
    // Gọi action fetchNews khi HomeScreen được render
    dispatch(fetchNews());
    dispatch(fetchTrending()); // Fetch trending keywords
    const fetchArticlesByCategory = async () => {
      try {
        const results = {};
        for (const category of categories) {
          const response = await dispatch(
            fetchCategoryArticles(category)
          ).unwrap();
          results[category] = response.slice(0, 8); // Lấy 8 bài viết mỗi danh mục
        }
        setCategoryArticles(results);
      } catch (error) {
        console.error("Lỗi khi fetch bài viết theo danh mục:", error);
      }
    };

    fetchArticlesByCategory();
  }, [dispatch]);

  const MainNews = articles[0];
  const TopThreeSecondaryNews = articles.slice(1, 4);
  const AdditionalNewsArticles = articles.slice(4, 12);
  const OverflowNews = articles.slice(12, 30);
  const visibleOverflowNews = OverflowNews.slice(0, visibleOverflowCount);

  const handleLoadMore = () => {
    setVisibleOverflowCount((prevCount) => prevCount + 50);
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <NewsTicker articles={articles} />
          <div className="home-container">
            {error ? (
              <ErrorMessage
                error={error}
                onRetry={() => dispatch(fetchNews())}
              />
            ) : (
              <div className="news-layout">
                <div className="first-column">
                  <TopKeywordSection keywords={keywords.slice(0, 10)} />
                </div>
                <div className="left-column">
                  {MainNews && <MainNewsCard article={MainNews} />}
                  {TopThreeSecondaryNews.length > 0 && (
                    <SecondaryNewsSection articles={TopThreeSecondaryNews} />
                  )}
                  {visibleOverflowNews.length > 0 && (
                    <AdditionalNews2 articles={visibleOverflowNews} />
                  )}
                  {Object.entries(categoryArticles).map(
                    ([category, articles]) => (
                      <CategoryAdditionalNews
                        key={category}
                        articles={articles}
                        category={category}
                      />
                    )
                  )}
                </div>
                <div className="right-column">
                  {AdditionalNewsArticles.length > 0 && (
                    <AdditionalNews articles={AdditionalNewsArticles} />
                  )}
                  <PartnersSection />
                  <div className="wordcloud-div">
                    <TrendingWordCloud data={keywords.slice(0, 20)} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="load-more-container">
            {visibleOverflowNews.length < OverflowNews.length && (
              <button className="load-more-button" onClick={handleLoadMore}>
                <span>Xem thêm</span> →
              </button>
            )}
          </div>
          <ThemeToggle />
          <ScrollToTop />
        </>
      )}
    </>
  );
};

export default HomeScreen;
