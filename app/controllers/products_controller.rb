class ProductsController < ApplicationController
  before_action :set_product, only: %i[ show update ]
  ALLOWED_PRODUCT_TYPES = %w[ Shoe ]
  # GET /products
  def index
    @products = Shoe.all
    render json: ProductBlueprint.render(@products, root: "products")
  end

  # GET /products/1
  def show
    render json: ProductBlueprint.render(@product)
  end

  # POST /products
  def create
    unless check_type
      render json: { error: "Invalid type" }, status: :unprocessable_entity
    end

    type = product_params[:type]
    klass = type.constantize
    product = klass.new(product_params)

    if product.save
      # Attach images after product + variants saved
      (params[:variant_images] || {}).each do |sku, images|
        variant = product.variants.find_by(sku: sku)
        Array(images).each { |image| variant.images.attach(image) } if variant
      end

      render json: ProductBlueprint.render(product), status: :created
    else
      Rails.logger.error "Product save failed: #{product.errors.full_messages.inspect}"
      product.variants.each do |v|
        Rails.logger.error "Variant #{v.sku} errors: #{v.errors.full_messages.inspect}"
      end
      render json: product.errors.full_messages + product.variants.flat_map(&:errors).flat_map(&:full_messages), status: :unprocessable_entity
    end
  end

  # PATCH/PUT /products/1
  def update
    unless check_type
      render json: { error: "Invalid type" }, status: :unprocessable_entity
    end

    if @product.update(product_params)
      # Re-attach or add images to variants
      (params[:variant_images] || {}).each do |sku, images|
        variant = @product.variants.find_by(sku: sku)
        Array(images).each { |image| variant.images.attach(image) } if variant
      end

      render json: ProductBlueprint.render(@product), status: :ok
    else
      Rails.logger.error "Product update failed: #{@product.errors.full_messages.inspect}"
      @product.variants.each do |v|
        Rails.logger.error "Variant #{v.sku} errors: #{v.errors.full_messages.inspect}"
      end
      render json: @product.errors.full_messages + @product.variants.flat_map(&:errors).flat_map(&:full_messages), status: :unprocessable_entity
    end
  end

  # DELETE /products/1
  def destroy
    @product = Product.find(params[:id])
    @product.destroy!
  end

  private

  def check_type
    type = product_params[:type]
    ALLOWED_PRODUCT_TYPES.include?(type) ? true : false
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_product
    @product = Product.includes(variants: [ images_attachments: :blob ]).find(params[:id])
  end

  def product_params
    params.require(:product).permit(
      :name,
      :type,
      :base_price,
      :stock,
      :description,
      :category_id,
      :brand,
      :gender,
      variants_attributes: [ :id, :sku, :color, :size, :variant_stock ]
    )
  end
end
