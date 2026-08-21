ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'seller';

CREATE OR REPLACE FUNCTION public.get_storefront(p_seller uuid)
RETURNS TABLE (
  store_name text,
  city text,
  product_id uuid,
  name text,
  emoji text,
  category text,
  description text,
  price numeric,
  rating numeric,
  stock integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(pr.store_name, 'متجر بايع'),
    pr.city,
    p.id,
    p.name,
    p.emoji,
    p.category,
    p.description,
    COALESCE(sp.custom_price, p.selling_price),
    p.rating,
    p.stock
  FROM public.store_products sp
  JOIN public.products p ON p.id = sp.product_id AND p.is_active = true
  LEFT JOIN public.profiles pr ON pr.id = sp.user_id
  WHERE sp.user_id = p_seller
  ORDER BY sp.created_at DESC
$$;

GRANT EXECUTE ON FUNCTION public.get_storefront(uuid) TO anon, authenticated;