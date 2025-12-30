import { Star, StarHalf, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingProps {
    rating: number
    totalReviews: number
    className?: string
    label?: string
    businessName?: string
    serviceName?: string
    maxRating?: number
    showFormattedCount?: boolean
}

// Utility function to format large numbers
const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
};

export function Rating({
    rating,
    totalReviews,
    className,
    label = "تقييمات عملائنا",
    businessName = "شركة العزل المتقدم لعزل الفوم بالرياض",
    serviceName,
    maxRating = 5,
    showFormattedCount = true
}: RatingProps) {
    // Ensure rating is between 0 and maxRating
    const clampedRating = Math.max(0, Math.min(maxRating, rating));
    const normalizedRating = (clampedRating / maxRating) * 5; // Normalize to 5-point scale for schema

    // Create array of stars based on maxRating
    const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

    // Format the review count for display
    const displayReviewCount = showFormattedCount && totalReviews > 999
        ? formatLargeNumber(totalReviews)
        : totalReviews.toLocaleString();

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-3 bg-card border border-border rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-shadow",
            className
        )}
            role="region"
            aria-labelledby="rating-title">
            {/* Label */}
            <h3 id="rating-title" className="text-sm md:text-base font-bold text-foreground mb-2 md:mb-4 font-heading">
                {label}
            </h3>

            {/* Stars Container */}
            <div className="flex items-center gap-0.5 md:gap-1 mb-2 md:mb-3" aria-label={`${clampedRating} out of ${maxRating} stars rating`}>
                {stars.map((starIndex) => {
                    let fillPercentage = 0;
                    if (clampedRating >= starIndex) {
                        fillPercentage = 100;
                    } else if (clampedRating > starIndex - 1) {
                        fillPercentage = (clampedRating - (starIndex - 1)) * 100;
                    }

                    return (
                        <div key={starIndex} className="relative w-6 h-6 md:w-8 md:h-8" aria-hidden="true">
                            {/* Background Star (Gray/Empty) */}
                            <Star
                                className="absolute inset-0 w-full h-full text-muted stroke-[1.5px]"
                                fill="transparent"
                            />

                            {/* Foreground Star (Gold/Filled) - Masked */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 fill-yellow-400 stroke-yellow-400"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rating Text */}
            <div className="flex items-center gap-1.5 md:gap-2 text-muted-foreground font-medium">
                <span className="text-xl md:text-2xl font-bold text-foreground">{clampedRating.toFixed(1)}</span>
                <span className="text-xs md:text-sm">/ {maxRating}.0</span>
            </div>

            {/* Review Count */}
            <div className="mt-1.5 md:mt-2 text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                <span>Based on {displayReviewCount}+ reviews</span>
            </div>

            {/* Schema.org Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": serviceName || businessName,
                        "provider": {
                            "@type": "LocalBusiness",
                            "name": businessName
                        },
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": normalizedRating.toFixed(1),
                            "bestRating": "5",
                            "worstRating": "1",
                            "ratingCount": totalReviews,
                            "reviewCount": totalReviews
                        }
                    }),
                }}
            />
        </div>
    );
}