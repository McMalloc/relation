class CodesController < ApplicationController
  before_action :set_code, only: [:show, :edit, :update, :destroy]
  
  @@qcolors = ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]
  
  # GET /codes
  # GET /codes.json
  def index
    @codes = Code.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @codes, root: false }
    end
  end

  # GET /codes/1
  # GET /codes/1.json
  def show
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @code, root: false }
    end
  end

  # GET /codes/new
  def new
    @code = Code.new
  end

  # GET /codes/1/edit
  def edit
  end

  # POST /codes
  # POST /codes.json
  def create
    @code = Code.new(code_params)
    @code.color = @@qcolors.sample
    # qcolors.delete(@code.color)
    respond_to do |format|
      if @code.save
        format.html { redirect_to @code, notice: 'Code was successfully created.' }
        format.json { render json: @code, status: :created }
      else
        format.html { render action: 'new' }
        format.json { render json: @code.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /codes/1
  # PATCH/PUT /codes/1.json
  def update
    respond_to do |format|
      if @code.update(code_params)
        format.html { redirect_to @code, notice: 'Code was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @code.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /codes/1
  # DELETE /codes/1.json
  def destroy
    @code.destroy
    respond_to do |format|
      format.html { redirect_to codes_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_code
      @code = Code.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def code_params
      params.require(:code).permit(:tag, :description, :color)
    end
end
