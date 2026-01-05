"use client";

import { BookCard } from "@/components/storefront/book-card";
import { Button } from "@/components/ui/button";
import { PublicBook } from "@/types/book";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

interface FeaturedBooksProps {
  books: PublicBook[];
}

export function FeaturedBooks({ books }: FeaturedBooksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const [dragDistance, setDragDistance] = useState(0);
  const DRAG_THRESHOLD = 5;

  // Tính toán số sách hiển thị dựa trên kích thước màn hình
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1024) setVisibleCount(5); // lg
      else if (width >= 768) setVisibleCount(3); // md
      else if (width >= 640) setVisibleCount(2); // sm
      else setVisibleCount(1); // xs
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const totalGroups = Math.ceil(books.length / visibleCount);

  const scrollToGroup = useCallback((index: number) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollWidth = container.scrollWidth;
    const groupWidth = scrollWidth / totalGroups;
    
    container.scrollTo({
      left: groupWidth * index,
      behavior: "smooth"
    });
    setCurrentIndex(index);
  }, [totalGroups]);

  const handlePrev = () => {
    const newIndex = currentIndex === 0 ? totalGroups - 1 : currentIndex - 1;
    scrollToGroup(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === totalGroups - 1 ? 0 : currentIndex + 1;
    scrollToGroup(newIndex);
  };

  // Xử lý kéo bằng chuột
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    setDragDistance(0); // Reset distance khi bắt đầu drag
    
    // Ngăn chặn selection text khi kéo
    e.preventDefault();
  };

  // Xử lý kéo bằng touch (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Tốc độ kéo
    containerRef.current.scrollLeft = scrollLeft - walk;
    
    // Tính khoảng cách đã kéo
    const distance = Math.abs(x - startX);
    setDragDistance(distance);
  }, [isDragging, startX, scrollLeft]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
    
    const distance = Math.abs(x - startX);
    setDragDistance(distance);
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    const wasDragging = isDragging;
    setIsDragging(false);
    
    // Nếu đã kéo một khoảng đủ lớn, xử lý snap
    if (wasDragging && dragDistance > DRAG_THRESHOLD) {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollWidth = container.scrollWidth;
      const groupWidth = scrollWidth / totalGroups;
      const currentScroll = container.scrollLeft;
      const newIndex = Math.round(currentScroll / groupWidth);
      
      scrollToGroup(Math.min(Math.max(newIndex, 0), totalGroups - 1));
    }
    
    setDragDistance(0);
  }, [isDragging, dragDistance, totalGroups, scrollToGroup]);

  // Xử lý click vào link/button bên trong card
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Chỉ chặn click nếu đã kéo một khoảng đủ lớn
    if (dragDistance > DRAG_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [dragDistance]);

  // Xử lý scroll wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    containerRef.current.scrollLeft += e.deltaY * 0.5;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Xử lý sự kiện mouse
    container.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Xử lý sự kiện touch
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseMove, handleTouchMove, handleWheel, handleMouseUp]);

  // Auto scroll (tùy chọn)
  useEffect(() => {
    if (books.length <= visibleCount) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Tự động chuyển mỗi 5 giây

    return () => clearInterval(interval);
  }, [currentIndex, books.length, visibleCount]);

  // Thêm event listener để xử lý link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Nếu đang kéo và khoảng cách kéo > ngưỡng, chặn click
      if (isDragging && dragDistance > DRAG_THRESHOLD) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Thêm listener cho tất cả link trong container
    const container = containerRef.current;
    if (container) {
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', handleLinkClick, true);
      });
    }

    return () => {
      if (container) {
        const links = container.querySelectorAll('a');
        links.forEach(link => {
          link.removeEventListener('click', handleLinkClick, true);
        });
      }
    };
  }, [isDragging, dragDistance]);

  return (
    <section className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Best Selling Books</h2>
          <p className="text-muted-foreground">Most loved books of the week</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePrev}
            disabled={books.length <= visibleCount}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleNext}
            disabled={books.length <= visibleCount}
            className="hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Container với kéo ngang mượt mà */}
      <div className="relative">
        <div 
          ref={containerRef}
          className={`flex overflow-x-hidden gap-4 pb-4 ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          style={{ 
            scrollBehavior: isDragging ? "auto" : "smooth",
            WebkitOverflowScrolling: "touch"
          }}
        >
          {books.map((book) => (
            <div 
              key={book._id} 
              className="flex-none"
              style={{ 
                width: `calc(${100 / Math.min(visibleCount, books.length)}% - 12px)` 
              }}
            >
              {/* Sử dụng BookCard trực tiếp, không wrap */}
              <BookCard {...book} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {books.length > visibleCount && totalGroups > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalGroups }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToGroup(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? "bg-primary w-6 scale-125" 
                  : "bg-muted hover:bg-primary/50 hover:scale-110"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hướng dẫn kéo (chỉ hiển thị trên desktop) */}
      {books.length > visibleCount && (
        <p className="text-center text-sm text-muted-foreground mt-4 hidden md:block">
          ← Click and drag anywhere to navigate →
        </p>
      )}
    </section>
  );
}