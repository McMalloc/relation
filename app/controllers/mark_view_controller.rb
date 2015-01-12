class MarkViewController < ApplicationController
  def marking
    @pass = Pass.find(params[:pass_id])
    @codes = Codes.find()
    render 'marking'
  end
  
  def show
    puts "Pass-show"
    puts params.to_yaml
    @pass = Pass.find(params[:id])
    render json: @pass, root: false
  end
end
