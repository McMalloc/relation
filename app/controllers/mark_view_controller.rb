class MarkViewController < ApplicationController
  def marking
    @pass = Pass.find(params[:pass_id])
    puts @pass.to_yaml
    render 'marking'
  end
end
